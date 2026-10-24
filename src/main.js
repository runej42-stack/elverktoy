// Inngang for appen. Modulene rører ikke DOM før boot() kalles, så de kan importeres i tester.

import { hasDOM } from './core/env.js';
import { boot } from './ui/shell.js';

if (hasDOM) boot();
