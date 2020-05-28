import { Platform } from '@ionic/angular';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { routes } from './routes';

import {
    GoogleMapsEvent, LatLng, GoogleMapsAnimation, MarkerOptions,
    GoogleMaps, Polyline, ILatLng, LatLngBounds, GoogleMap, Marker
} from '@ionic-native/google-maps/ngx';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {

    @ViewChild('map', { static: false }) private mapElement: ElementRef;
    private map: GoogleMap;
    private polylines: any[] = [];

    constructor(
        private platform: Platform
    ) {
    }

    async ngAfterViewInit() {
        // await this.initializeMap();
    }

    async ionViewDidEnter() {
        await this.initializeMap();
    }


    async initializeMap() {
        await this.platform.ready;
        console.log(this.mapElement);
        this.map = GoogleMaps.create(this.mapElement.nativeElement);
        console.log('Map created');

        this.map.one(GoogleMapsEvent.MAP_READY).then(async (data: any) => {
            console.log('MAP_READY event fired');

            const coordinates: LatLng = new LatLng(40.712480000000006, -74.0062);
            const position = {
                target: coordinates,
                zoom: 9
            };
            this.map.animateCamera(position);

            await this.addPolyLine(routes.route1, 'skyblue', 0);
            await this.addPolyLine(routes.route2, 'silver', 1);
        });
    }

    private async addPolyLine(points: any[], color: string, idx: number) {
        const options = {
            points,
            color,
            width: 6,
            geodesic: true,
            clickable: true,
            zIndex: idx === 0 ? 11 : 0,
            visible: true,
            idx
        };

        const polyline = await this.map.addPolyline(options);
        polyline.on(GoogleMapsEvent.POLYLINE_CLICK).subscribe(data => {
            console.log('POLYLINE_CLICK event: entering', data);

            try {
                if (!data || data.length < 1) {
                    console.log('POLYLINE_CLICK event: no data');
                    return;
                }
                const currentPolyline = data[1];
                if (currentPolyline != null) {
                    if (currentPolyline.getStrokeColor() === 'skyblue') {
                        return;
                    }

                    for (const pl of this.polylines) {
                        pl.setStrokeColor('silver');
                        pl.setZIndex(0);
                    }

                    for (const pl of this.polylines) {

                        if (currentPolyline.get('idx') === pl.get('idx')) {
                            pl.setStrokeColor('skyblue');
                            pl.setZIndex(10);
                            break;
                        }
                    }
                }
            } catch (err) {
                console.log('POLYLINE_CLICK error:', err);
            }

        }); // end of event listener handler

        this.polylines.push(polyline);
    }


}
