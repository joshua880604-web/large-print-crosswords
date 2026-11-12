import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',workers:2,use:{baseURL:'http://127.0.0.1:4321',headless:true,launchOptions:{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}},webServer:{command:'npm run preview -- --port 4321',url:'http://127.0.0.1:4321',reuseExistingServer:true},reporter:'list'});
