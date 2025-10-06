// @refresh reload
import { mount, StartClient } from '@solidjs/start/client';

import './env/client';

mount(() => <StartClient />, document.getElementById('app') as HTMLElement);
