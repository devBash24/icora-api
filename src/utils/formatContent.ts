

export const importStatement = `import { IconBaseProps, GenIcon } from '@/lib/icons/gen';\n\n`;

export const formatIconContent = (content: string) => {
    const formattedContent = content
      .replace(/\\n/g, '\n')
      .replace(/\\/g, '');
  
    // const importStatement = `import { IconBaseProps, GenIcon } from '@lib/icons';\n\n`;
  
    return formattedContent;
};

