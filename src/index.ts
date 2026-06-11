// 1. Export core styles (Vite will automatically extract and merge into a single css file)
import './inkflow-editor.css';

// 2. Export core classes
export { InkflowEditor } from './core/editor';

// 3. Export theme configuration for external extension or modification
export { inkflowTheme } from './themes/inkflow';

// 4. Export TypeScript types to provide perfect code completion for integrators
export type {
    EmojiExtension,
    InkflowOptions,
    EditorInstance,
    ThemeClasses,
    LocaleDict,
    ToolbarLayout,
    ToolbarMode
} from './types/index';
