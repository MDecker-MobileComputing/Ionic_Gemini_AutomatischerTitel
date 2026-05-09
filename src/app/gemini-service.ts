import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { EinstellungenService } from './einstellungen-service';


/**
 * Diese Service-Klasse kapselt die Kommunikation mit der KI "Google Gemini".
 */
@Injectable({
  providedIn: 'root',
})
export class GeminiService {

  private static readonly GEMINI_BASIS_URL = "https://generativelanguage.googleapis.com/v1beta";


  /**
    * Konstruktor für *Dependency Injection*
    */
  constructor( private einstellungenService: EinstellungenService,
               private httpClient: HttpClient ) {}

  /**
   * Fragt über REST-Calls die verfügbaren Gemini-Modelle ab.
   * Hiermit kann getestet werden, ob ein formal korrekter API-Key auch
   * tatsächlich funktioniert und ob die KI erreichbar ist.
   *
   * @returns Array mit den Namen der verfügbaren Gemini-Modelle,
   *          z.B. `["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash" ]`
   * 
   * @throws Fehler, wenn kein API-Key gefunden wird oder wenn die HTTP-Anfrage fehlschlägt
   */
  public async holeModelle(): Promise<string[]> {

    const apiKey = await this.einstellungenService.leseEinstellung( EinstellungenService.SCHLUESSEL_API_KEY );
    if (!apiKey) {

      throw new Error( "API-Key nicht gesetzt" );
    }

    const url = `${GeminiService.GEMINI_BASIS_URL}/models?keyxx=${apiKey}&pageSize=3`;

    const antwort = await firstValueFrom(
      this.httpClient.get<{ models?: Array<{ name?: string }> }>( url )
    );

    const modelleArray = (antwort.models ?? [])
      .map((modell) => modell.name ?? "")
      .filter((name) => name.length > 0)
      .map((name) => name.replace(/^models\//, ""));

    return modelleArray;
  }


  /**
   * Erzeugt Titelvorschläge für einen gegebenen Text.
   *
   * @param text Text, für den ein Titel erzeugt werden soll
   *
   * @returns Array mit Titelvorschlägen, die von der KI generiert wurden
   */
  async erzeugeTitelvorschlaege( text: string ): Promise<string[]> {

    //throw new Error("Die Methode erzeugeTitelvorschlaege() ist noch nicht implementiert. Bitte implementieren Sie diese Methode, um Titelvorschläge zu generieren.");

    const titelArray = [ "Bericht Reparatur", "Bericht Akquise" ];

    return titelArray;
  }

}
