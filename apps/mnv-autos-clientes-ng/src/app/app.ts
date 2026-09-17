import { Component, inject, OnInit } from '@angular/core';

import appInfo from '../assets/config/app-info.json';
import { RouterOutlet } from '@angular/router';
import { NotificationListenerService } from '@mnv-autos-clientes/core';
import { EmisionProcesoService } from '@mnv-autos-clientes/data';

@Component({
	imports: [RouterOutlet],
	selector: 'app-root',
	templateUrl: './app.html',
	styleUrl: './app.scss'
})
export class App implements OnInit {
	private readonly _ = inject(NotificationListenerService);
	private readonly emisionProcesoService = inject(EmisionProcesoService);
	appName = appInfo.name;
	version = appInfo.version;

	ngOnInit(): void {
		this.emisionProcesoService.iniciarProceso();
	}
}
