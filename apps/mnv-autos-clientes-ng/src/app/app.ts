import { Component } from '@angular/core';

import appInfo from '../assets/config/app-info.json';
import { RouterOutlet } from '@angular/router';

@Component({
	imports: [RouterOutlet],
	selector: 'app-root',
	templateUrl: './app.html',
	styleUrl: './app.scss'
})
export class App {
	appName = appInfo.name;
	version = appInfo.version;
}
