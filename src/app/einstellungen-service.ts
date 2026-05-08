import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';


/**
 * Verwaltet die Einstellungen der App. Alle Einstellungen werden als String gespeichert.
 * Verwendet intern das folgende Capacitor-Plugin: https://capacitorjs.com/docs/apis/preferences
 *
 * Funktioniert auch in Browsern, da das Plugin in diesem Fall die `localStorage`-API verwendet.
 * Hier wird z.B. für den Key `abc` der Wert `CapacitorStorage.abc` verwendet.
 */
@Injectable({
  providedIn: 'root',
})
export class EinstellungenService {

  public static readonly SCHLUESSEL_API_KEY = "geminiApiKey";

  public static readonly SCHLUESSEL_MODELL = "geminiModel";


  /**
   * Speichert eine Einstellung. Alle Einstellungen werden als String gespeichert.
   *
   * @param schluessel  Key unter dem der Einstellungswert gespeichert werden soll
   *
   * @param wert Wert der Einstellung, z.B. API-Key oder ausgewähltes Gemini-Modell
   */
  async setzeEinstellung( schluessel: string, wert: string ): Promise<void> {

    await Preferences.set({ key: schluessel, value: wert });
  }


  /**
   * Liest eine Einstellung aus. Gibt den gespeicherten Wert zurück
   * oder "" (leerer String) wenn nicht vorhanden.
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
