import { Component, OnInit }    from '@angular/core';
import { EinstellungenService } from '../einstellungen-service';
import { GeminiService }        from '../gemini-service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {

  /** Zur Auswahl der verfügbaren Gemini-Modelle, müssen alphabetisch sortiert sein. */
  public static readonly GEMINI_MODELLE: readonly string[] = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
  ];

  /** Für das Template: Instanz-Zugriff auf die statische Modellliste. */
  public readonly GEMINI_MODELLE: readonly string[] = Tab2Page.GEMINI_MODELLE;

  /** Regulärer Ausdruck für die Validierung des API-Keys. */
  private static readonly API_KEY_REGEXP_PATTERN = /^[A-Za-z0-9_-]{30,128}$/;

  // Aktuell im Template angezeigte Werte und Meldungen
  public apiKey: string       = "";
  public geminiModell: string = Tab2Page.GEMINI_MODELLE[0];

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

    this.geminiModell =
      await this.einstellungenService.leseEinstellung(
                    EinstellungenService.SCHLUESSEL_MODELL
      );
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

      const modelleArray = await this.geminiService.holeModelle();
      console.log( "Verfügbare Gemini-Modelle: ", modelleArray );

    } catch ( fehler ) {
      
      this.meldungApiKey    = "Fehler bei Testverbindung zu Gemini: " + this.ermittleFehlermeldung( fehler );
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
   * Wandelt unterschiedliche Fehlerobjekte in eine lesbare Meldung um.
   */
  private ermittleFehlermeldung( fehler: unknown ): string {

    if ( typeof fehler === "string" ) {

      return fehler;
    }

    if ( fehler instanceof Error ) {

      return fehler.message;
    }

    if ( fehler && typeof fehler === "object" ) {

      const fehlerObj = fehler as {
        status?: number;
        statusText?: string;
        message?: string;
        error?: unknown;
      };

      const apiFehler = fehlerObj.error as {
        message?: string;
        error?: { message?: string };
      } | undefined;

      const apiFehlertext =
        apiFehler?.error?.message ??
        apiFehler?.message ??
        ( typeof fehlerObj.error === "string" ? fehlerObj.error : undefined ) ??
        fehlerObj.message;

      if ( apiFehlertext ) {

        return apiFehlertext;
      }

      if ( typeof fehlerObj.status === "number" ) {

        return `HTTP ${fehlerObj.status}${fehlerObj.statusText ? ` ${fehlerObj.statusText}` : ""}`;
      }

      try {

        return JSON.stringify( fehlerObj );

      } catch {

        return "Unbekannter Fehler";
      }
    }

    return "Unbekannter Fehler";
  }

}
