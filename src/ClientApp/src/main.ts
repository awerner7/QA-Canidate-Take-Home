import './styles.css';
import { TaskApp } from './app';

const root = document.querySelector<HTMLElement>('#app');
if (!root) {
  throw new Error('Missing #app root');
}

void new TaskApp(root).init();
