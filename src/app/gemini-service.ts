import { Injectable } from '@angular/core';


/**
 * Diese Service-Klasse kapselt die Kommunikation mit der KI "Google Gemini".
 */
@Injectable({
  providedIn: 'root',
})
export class GeminiService {

  async erzeugeTitelvorschlaege( text: string ): Promise<string[]> {

    //throw new Error("Die Methode erzeugeTitelvorschlaege() ist noch nicht implementiert. Bitte implementieren Sie diese Methode, um Titelvorschläge zu generieren.");

    const titelArray = [ "Bericht Reparatur", "Bericht Akquise" ];

    return titelArray;
  }

}
