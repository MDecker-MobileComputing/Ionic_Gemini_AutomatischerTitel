import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { EinstellungenService } from './einstellungen-service';
import {
  GeminiGenerateContentRequest,
  GeminiGenerateContentResponse,
} from './gemini-api.types';

import { Tab2Page } from './tab2/tab2.page';


/**
 * Diese Service-Klasse kapselt die Kommunikation über HTTP mit der KI "Google Gemini".
 */
@Injectable({
  providedIn: 'root',
})
export class GeminiService {

  /** Basis-URL für die REST-API von Google Gemini */
  private static readonly GEMINI_BASIS_URL = "https://generativelanguage.googleapis.com/v1beta";


  /**
    * Konstruktor für *Dependency Injection*
    */
  constructor( private einstellungenService: EinstellungenService,
               private httpClient: HttpClient ) {}

  /**
   * Fragt über REST-Calls einige der verfügbaren Gemini-Modelle ab.
   * Hiermit kann getestet werden, ob ein formal korrekter API-Key auch
   * tatsächlich funktioniert und ob die KI erreichbar ist.
   *
   * @param apiKey API-Key, der getestet werden soll. 
   * 
   * @returns Array mit einigen verfügbaren Gemini-Modellen (aber nicht allen),
   *          z.B. `["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash" ]`
   * 
   * @throws Fehler, wenn kein API-Key gefunden wird oder wenn die HTTP-Anfrage fehlschlägt
   */
  public async holeModelle( apiKey: string): Promise<string[]> {

    const url = `${GeminiService.GEMINI_BASIS_URL}/models?key=${apiKey}&pageSize=3`;

    const httpAntwortObservable =
        this.httpClient.get<{ models?: Array<{ name?: string }> }>( url );

    const antwort = await firstValueFrom( httpAntwortObservable );

    const modelleArray = ( antwort.models ?? [] )
      .map(    (modell) => modell.name ?? "" )
      .filter( (name)   => name.length > 0   )
      .map(    (name)   => name.replace( /^models\//, "" ) );

    return modelleArray ;
  }


  /**
   * Erzeugt Titelvorschläge für einen gegebenen Text.
   *
   * @param text Text, für den ein Titel erzeugt werden soll
   *
   * @returns Array mit Titelvorschlägen, die von der KI generiert wurden
   * 
   * @throws Wenn Fehler beim API-Aufruf, z.B. kein API-Key oder ungültige KI-Antwort
   */
  public async erzeugeTitelvorschlaege( text: string ): Promise<string[]> {

    const apiKey = 
          await this.einstellungenService.leseEinstellung( 
                    EinstellungenService.SCHLUESSEL_API_KEY 
          );

    if ( !apiKey ) {

      throw new Error( "Bitte konfigurieren Sie zuerst einen API-Key auf dem Tab >Einstellungen<." );
    }


    const model = 
          await this.einstellungenService.leseEinstellung(
            EinstellungenService.SCHLUESSEL_MODELL,
            Tab2Page.DEFAULT_GEMINI_MODELL
          );

    const anzahlTitelvorschlaegeString =
          await this.einstellungenService.leseEinstellung(
              EinstellungenService.SCHLUESSEL_ANZAHL_TITELVORSCHLAEGE,
              Tab2Page.DEFAULT_TITELVORSCHLAEGE
          );

    const temperaturString =
          await this.einstellungenService.leseEinstellung(
              EinstellungenService.SCHLUESSEL_TEMPERATUR,
              Tab2Page.DEFAULT_TEMPERATUR
          );
    const temperatur = Number.parseFloat( temperaturString );

    const prompt =
          `Erzeuge genau ${anzahlTitelvorschlaegeString} Titelvorschläge für folgenden Text. \
          Die Titel sollen sachlich und nüchtern formuliert sein, \
          ohne reißerische oder werbende Sprache. \
          Gib als Antwort ausschließlich ein gültiges JSON-Array aus Strings zurück, \
          z.B. ["Titel 1", "Titel 2", "Titel 3"]. \
          Gib keinen zusätzlichen Text, keine Markdown-Formatierung und keine Erklärungen aus. \
          Text: ${text}`;
 
    const url = `${GeminiService.GEMINI_BASIS_URL}/models/${model}:generateContent?key=${apiKey}`;
      
    const httpRequestBody: GeminiGenerateContentRequest = {
      generationConfig: {
        responseMimeType: "application/json",
        temperature: temperatur
      },
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    }; 
    // Je höher die Temperatur, desto kreativer die Antworten. Bei 0.7 ist es eine gute Balance 
    // zwischen Kreativität und Verständlichkeit.
    //
    // Weitere Parts neben dem Prompt könnten z.B. Binärdaten sein, z.B. Bilder oder PDFs.

    console.log(
      `Anfrage für ${anzahlTitelvorschlaegeString} Titelvorschläge an KI-Modell "${model}" gesendet ` +
      `(Temperatur: ${temperatur.toFixed(1)}) ...`
    );

    const antwortObservable = 
        this.httpClient.post<GeminiGenerateContentResponse>( url, httpRequestBody );
    
    // Beispiel für JSON-Response: 
    // https://gist.github.com/MDecker-MobileComputing/85e830f233962bf2ad479385377647d5

    const antwort = await firstValueFrom( antwortObservable );

    const antwortText = antwort.candidates?.[0].content?.parts?.[0]?.text?.trim();

    console.log( "Rohantwort der KI:", antwortText );
    
    if ( !antwortText ) { 
      
      throw new Error( "Die KI hat keine gültige Antwort zurückgegeben." );
    }

    const parsedArray = JSON.parse( antwortText );

    if ( Array.isArray( parsedArray ) == false ) {

      throw new Error( "Die KI-Antwort ist kein gültiges JSON-Array." );
    }

    return parsedArray;
  }

}
