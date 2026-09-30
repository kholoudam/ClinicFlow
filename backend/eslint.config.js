import js from '@eslint/js';
export default [{ignores:['node_modules/**']},js.configs.recommended,{languageOptions:{ecmaVersion:'latest',sourceType:'module'},rules:{'no-console':'off','no-unused-vars':['error',{argsIgnorePattern:'^_'}]}}];
