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

  /** Schlüssel für Einstellung mit API-Key. */
  public static readonly SCHLUESSEL_API_KEY = "geminiApiKey";

  /** Schlüssel für Einstellung mit ausgewähltem Gemini-Modell.  */
  public static readonly SCHLUESSEL_MODELL = "geminiModel";

  /** Schlüssel für Einstellung mit Anzahl von Titelvorschlägen pro API-Request. */
  public static readonly SCHLUESSEL_ANZAHL_TITELVORSCHLAEGE = "anzahlTitelvorschlaege";


  /**
   * Speichert eine Einstellung. Alle Einstellungen werden als String gespeichert.
   *
   * @param schluessel  Key unter dem der Einstellungswert gespeichert werden soll
   *
   * @param wert Wert der Einstellung, z.B. API-Key oder ausgewähltes Gemini-Modell
   */
  public async setzeEinstellung( schluessel: string, wert: string ): Promise<void> {

    const einstellungObjekt = { 
                                key  : schluessel, 
                                value: wert 
                              };

    await Preferences.set( einstellungObjekt );
  }


  /**
   * Liest eine Einstellung aus. Gibt den gespeicherten Wert zurück
   * oder `defaultWert` wenn nicht vorhanden.
   *
   * @param schluessel Key für Einstellungswert
   * 
   * @param defaultWert Optionaler Fallback-Wert, wenn keine Einstellung vorhanden ist
   *
   * @returns String für `schluessel` oder `defaultWert` wenn nicht vorhanden
   */
  public async leseEinstellung( schluessel: string, defaultWert: string = "" ): Promise<string> {

    const { value } = await Preferences.get({ key: schluessel });
    return value ?? defaultWert;
  }

}
