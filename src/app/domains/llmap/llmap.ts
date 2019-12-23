import * as L from 'leaflet';

import * as Constants from './constants';

export class LLMap {
  llmap!: L.Map;
  tweetMarker: {
    [id: number]: L.Marker;
  } = {};

  initMap(elem: HTMLElement): void {
    /** Layers */
    const streetsLayer = this.createTileLayer(Constants.LayerId.MapboxStreets);
    const satelliteLayer = this.createTileLayer(Constants.LayerId.MapboxSatellite);

    this.llmap = L.map(elem)
      .setView(Constants.DefaultCenteringPosition as L.LatLngExpression, Constants.DefaultZoomSize)
      .addLayer(streetsLayer);

    L.control
      .layers(
        {
          street: streetsLayer,
          satellite: satelliteLayer,
        },
        {},
        { position: 'bottomright' },
      )
      .addTo(this.llmap);
  }

  private createTileLayer(layerId: Constants.LayerId): L.Layer {
    let layerUrl: string;
    switch (layerId) {
      case Constants.LayerId.MapboxStreets:
        layerUrl = Constants.StreetLayer;
        break;
      case Constants.LayerId.MapboxSatellite:
        layerUrl = Constants.SatelliteLayer;
        break;
    }
    return L.tileLayer(layerUrl, {
      attribution: Constants.Attribution,
      maxZoom: Constants.LayerMaxZoomSize,
      id: layerId,
      accessToken: Constants.Token,
    });
  }

  putMarker(marker: {
    id: number;
    lat: number;
    lng: number;
    name: string;
    img: string;
    link: string;
    text: string;
    createdAt: string;
    place: string;
  }): void {
    /** Icon */
    const markerHtmlStyles1 = `
      position: absolute;
      left: -12px;
      top: -12px;
      border-radius: 50%;
      border: 8px solid #1ca1f2;
      width: 8px;
      height: 8px;
    `;
    const markerHtmlStyles2 = `
      position: absolute;
      bottom: -30px;
      left: -6px;
      border: 10px solid transparent;
      border-top: 17px solid #1ca1f2;
    `;
    const icon = L.divIcon({
      className: 'marker-icon',
      iconAnchor: [0, 24],
      popupAnchor: [0, -24],
      html: `
        <span style="${markerHtmlStyles1}" />
        <span style="${markerHtmlStyles2}" />
      `,
    });

    const comment = `
      <p style="font-size: 14px;">
        <a href="${marker.link}" target="_blank" rel="noopener">
          <img src="${marker.img}" width="24" style="vertical-align: middle;" />
        </a>
        <a href="${marker.link}" target="_blank" rel="noopener">
          <b>${marker.name}</b>
        </a>
      </p>
      <p>${marker.text}</p>
      <p><date>${marker.createdAt}</date> ${marker.place}</p>
    `;

    this.tweetMarker[marker.id] = L.marker([marker.lat, marker.lng], {
      icon,
      draggable: false,
    })
      .addTo(this.llmap)
      .bindPopup(comment, {
        closeButton: true,
        autoClose: false,
        closeOnClick: false,
      })
      .openPopup();
  }

  clearMarker(): void {
    Object.values(this.tweetMarker).forEach(marker => {
      this.llmap.removeLayer(marker);
    });
    Object.keys(this.tweetMarker).forEach(key => {
      delete this.tweetMarker[key];
    });
  }

  panTo(latlng: { lat: number; lng: number }): void {
    this.llmap.panTo(new L.LatLng(latlng.lat, latlng.lng));
  }
}
