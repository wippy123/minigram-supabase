import { Mark, markInputRule, markPasteRule } from '@tiptap/core';

export interface BackgroundColorOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    backgroundColor: {
      setBackgroundColor: (color: string) => ReturnType;
      unsetBackgroundColor: () => ReturnType;
    };
  }
}

export const BackgroundColor = Mark.create<BackgroundColorOptions>({
  name: 'backgroundColor',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: element => element.style.backgroundColor,
        renderHTML: attributes => {
          if (!attributes.color) {
            return {};
          }
          return {
            style: `background-color: ${attributes.color}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        style: 'background-color',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', this.options.HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setBackgroundColor: color => ({ commands }) => {
        return commands.setMark(this.name, { color });
      },
      unsetBackgroundColor: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },

  addInputRules() {
    return [
      markInputRule({
        find: /(?:^|\s)((?:\[\[bg:)(.+?)(?:\]\]))$/,
        type: this.type,
        getAttributes: match => ({ color: match[2] }),
      }),
    ];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: /(?:^|\s)((?:\[\[bg:)(.+?)(?:\]\]))/g,
        type: this.type,
        getAttributes: match => ({ color: match[2] }),
      }),
    ];
  },
});
