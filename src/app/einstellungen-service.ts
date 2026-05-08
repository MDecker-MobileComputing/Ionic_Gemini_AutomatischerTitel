import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';


/**
 * Verwaltet die Einstellungen der App. Alle Einstellungen werden als String gespeichert.
 * Verwendet intern das folgende Capacitor-Plugin: https://capacitorjs.com/docs/apis/preferences
 *
 * Funktioniert auch in Browsern, da das Plugin in diesem Fall die `localStorage`-API verwendet.
 */
@Injectable({
  providedIn: 'root',
})
export class EinstellungenService {

  async setzeEinstellung( schluessel: string, wert: string ): Promise<void> {

    await Preferences.set({ key: schluessel, value: wert });
  }

  /**
   *
   * @param schluessel Key für Einstellungswert
   *
   * @returns String für `schluessel` oder "" (leerer String) wenn nicht vorhanden
   */
  async leseEinstellung( schluessel: string  ): Promise<string> {

    const { value } = await Preferences.get({ key: schluessel });
    return value ?? "";
  }

}
