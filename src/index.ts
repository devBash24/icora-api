import express, { Request, Response } from "express";
import cors from "cors";
import { supabase } from "./services/supabase";
const app = express();
const PORT = process.env.PORT || 3000;
import { formatIconContent} from "./utils/formatContent";
import { createIconFile } from "./utils/iconFile";
import { apiLimiter, strictLimiter } from './middleware/rateLimiter';
import { cacheControl } from './middleware/cache';
import { securityMiddleware } from './middleware/security';
import { validateIconRequest } from './middleware/validation';

// Middleware
app.use(cors());
app.use(express.json());
app.use(securityMiddleware);
app.use('/api/', apiLimiter);  
app.use('/api/icons/all', strictLimiter); // Strict rate limiting for all icons


app.get("/", (_req: Request, res: Response) => {
    res.redirect('https://icora.vercel.app/')
});


app.get("/api/icons", validateIconRequest, cacheControl, async(req: Request, res: Response)=>{
    const { library, name } = req.query as { library: string; name: string }
    try{
        if(!library || !name){
            throw new Error("Library and name are required.")
        }
        const { data, error } = await supabase.from("icons").select("*").eq("library", library).eq("name", name);
        if(error){
            throw new Error("Error fetching icons from database.")
        }
        const content =  formatIconContent(data[0].content);
        res.json({ success: true, data: {name: data[0].name, library: data[0].library, content: content} });
    }
    catch(error){
        if(error instanceof Error){
            if(error.message.includes("Library and name are required.")){
                res.status(400).json({ success: false, error: "Library and name are required." });
            }
            else{
                res.status(500).json({ success: false, error: "Internal server error" });
            }
        }
        else{
            res.status(500).json({ success: false, error: "Internal server error" });
        }
    }
})

app.get('/api/icons/:library', async(req: Request, res: Response)=>{
    const { library } = req.params;
    const { data, error } = await supabase.from("icons").select("id, name, library,content").eq("library", library);
    if(error){
        res.status(500).json({ success: false, error: "Internal server error" });
    }
    if(!data || data === null || data.length === 0){
        res.status(404).json({ success: false, error: "No icons found for this icon library" });
    }
    res.json({ success: true, data: {name: library, content: createIconFile(data || []) } });
})


app.get('/api/icons/all/libraries', async(req: Request, res: Response)=>{
    const { data, error } = await supabase.rpc('get_unique_icon_library')
    if(error){
        res.status(500).json({ success: false, error: "Internal server error" });   
    }
    res.json({ success: true, data: Array.isArray(data) ? data.map(item => item.unique_value) : [] });
})




app.get('/api/icons/all/libraries/:library', async(req: Request, res: Response)=>{
    const { library } = req.params;
    const { data, error } = await supabase.from("icons").select("*").eq("library", library);
    if(error){
        res.status(500).json({ success: false, error: "Internal server error" });
    }
    if(!data || data === null || data.length === 0){
        res.status(404).json({ success: false, error: "No icons found for this icon library" });
    }
    res.json({ success: true, data: data });
})

app.get('/api/search',cacheControl, async(req: Request, res: Response) => {
    const { q = '', page = 1, limit = 50 } = req.query as { q: string; page: string; limit: string };
    const pageNumber = parseInt(page as string);
    const itemsPerPage = parseInt(limit as string);
    const offset = (pageNumber - 1) * itemsPerPage;
    try {
        const { data, error, count } = await supabase
            .from('icons')
            .select('*', { count: 'exact' })
            .ilike('name', `%${q}%`)
            .range(offset, offset + itemsPerPage - 1);


        if (error) throw new Error('Error fetching icons');

        res.json({
            data: data ,
            hasMore: (offset + itemsPerPage) < (count || 0)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});






// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error'
    });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});




// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
