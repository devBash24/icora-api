import { formatIconContent} from "./formatContent";


export const createIconFile = (data: {name: string, library: string, content: string}[]) => {
    let content = ""
    for(const icon of data){
        content += formatIconContent(icon.content)+"\n\n";
    }
    return content;

}
