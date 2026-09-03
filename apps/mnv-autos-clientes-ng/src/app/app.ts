import { Component, inject } from '@angular/core';

import appInfo from '../assets/config/app-info.json';
import { RouterOutlet } from '@angular/router';
import { NotificationListenerService } from '@mnv-autos-clientes/core';

@Component({
	imports: [RouterOutlet],
	selector: 'app-root',
	templateUrl: './app.html',
	styleUrl: './app.scss'
})
export class App {
	private readonly _ = inject(NotificationListenerService);
	appName = appInfo.name;
	version = appInfo.version;
}
