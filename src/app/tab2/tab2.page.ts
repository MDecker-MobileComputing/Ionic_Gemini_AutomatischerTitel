import { Component, OnInit } from '@angular/core';

import { EinstellungenService }    from '../einstellungen-service';
import { GeminiService }           from '../gemini-service';
import { extrahiereFehlermeldung } from '../fehlertext.util';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {

  /** 
   * Zur Auswahl der verfügbaren Gemini-Modelle, müssen alphabetisch sortiert sein. 
   * Hier nur für das Konto, mit dem der API-Key erzeugt wurde, verfügbare Modelle eintragen.
   * 
   * Verfügbare Modelle finden:
   * * Auf Seite https://aistudio.google.com/rate-limit gehen
   * * Schalter "Alle Modelle anzeigen" aktivieren
   * * Spalte "Kategorie" sortieren und nach "Textausgabemodelle" suchen
   * * Modelle auswählen, die für alle drei Metriken RPM, TPM und RPD _nicht_ "0 / 0" haben
   *     
   * * siehe auch https://github.com/MDecker-MobileComputing/Nodejs_GeminiTest#usage-%C3%BCberwachen
   */
  public static readonly GEMINI_MODELLE: readonly string[] = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite",
  ];

  public static readonly DEFAULT_TITELVORSCHLAEGE = "5";
  public static readonly DEFAULT_GEMINI_MODELL    = Tab2Page.GEMINI_MODELLE[0];

  /** Für das Template: Instanz-Zugriff auf die statische Modellliste. */
  public readonly GEMINI_MODELLE: readonly string[] = Tab2Page.GEMINI_MODELLE;

  /** Regulärer Ausdruck für die Validierung des API-Keys. */
  private static readonly API_KEY_REGEXP_PATTERN = /^[A-Za-z0-9_-]{30,128}$/;


  // Aktuell im Template angezeigte Werte und Meldungen
  public apiKey: string       = "";
  public geminiModell: string = Tab2Page.GEMINI_MODELLE[0];
  public anzahlTitelvorschlaege: number = Number.parseInt( Tab2Page.DEFAULT_TITELVORSCHLAEGE, 10 );

  // Meldungen für die Validierung des API-Keys
  public meldungApiKey: string     = "";
  public meldungIstFehler: boolean = false;


  /**
   * Konstruktor für *Dependency Injection*
   */
  constructor( private einstellungenService: EinstellungenService,
               private geminiService: GeminiService ) {}


  /**
   * Initialisierung der Seite: Laden der gespeicherten Einstellungen.
   */
  async ngOnInit() {

    this.apiKey =
        await this.einstellungenService.leseEinstellung(
                    EinstellungenService.SCHLUESSEL_API_KEY
        );

    const gespeichertesModell =
      await this.einstellungenService.leseEinstellung(
                    EinstellungenService.SCHLUESSEL_MODELL,
                    Tab2Page.GEMINI_MODELLE[0]
      );

    if ( Tab2Page.GEMINI_MODELLE.includes( gespeichertesModell ) ) {

      this.geminiModell = gespeichertesModell;
    }

    const gespeicherteAnzahlString =
      await this.einstellungenService.leseEinstellung(
                    EinstellungenService.SCHLUESSEL_ANZAHL_TITELVORSCHLAEGE,
                    Tab2Page.DEFAULT_TITELVORSCHLAEGE
      );

    this.anzahlTitelvorschlaege = Number.parseInt( gespeicherteAnzahlString, 10 );
  }


  /**
   * Event-Handler für den Button "API-Key prüfen und speichern".
   * Validiert den eingegebenen API-Key und speichert ihn bei Erfolg.
   */
  async onApiKeyPruefenButton(): Promise<void> {

    const bereinigterKey = this.apiKey.trim();

    if ( !Tab2Page.API_KEY_REGEXP_PATTERN.test( bereinigterKey ) ) {

      this.meldungApiKey    = "Ungültiger API-Key. Erlaubt sind 30-128 Zeichen: A-Z, a-z, 0-9, _ und -.";
      this.meldungIstFehler = true;
      return;
    }

    try {

      const modelleArray = await this.geminiService.holeModelle( bereinigterKey );
      console.log( "Einige der verfügbaren Gemini-Modelle: ", modelleArray );

    } catch ( fehler ) {
      
      this.meldungApiKey    = "Fehler bei Testverbindung zu Gemini: " + extrahiereFehlermeldung( fehler );
      this.meldungIstFehler = true;
      return; 
    }

    await this.einstellungenService.setzeEinstellung(
                        EinstellungenService.SCHLUESSEL_API_KEY,
                        bereinigterKey );

    this.apiKey           = bereinigterKey;
    this.meldungApiKey    = "API-Key erfolgreich gespeichert.";
    this.meldungIstFehler = false;
  }


  /**
   * Speichert das aktuell im Dropdown ausgewählte Gemini-Modell.
   */
  async onGeminiModellGeaendert(): Promise<void> {

    await this.einstellungenService.setzeEinstellung(

      EinstellungenService.SCHLUESSEL_MODELL,
      this.geminiModell
    );
  }


  /**
   * Event-Handler für neuen Wert der Anzahl von Titelvorschlägen: 
   * Speichert die neue Anzahl in den Einstellungen.
   */
  async onAnzahlTitelvorschlaegeGeaendert(): Promise<void> {

    await this.einstellungenService.setzeEinstellung(
      EinstellungenService.SCHLUESSEL_ANZAHL_TITELVORSCHLAEGE,
      this.anzahlTitelvorschlaege.toString()
    );
  }

}
