import { Component } from '@angular/core';
import { GeminiService } from '../gemini-service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  /** Titel, der ggf. automatisch generiert wird. */
  public titel: string = "";

  /** Textinhalt des Editors, für den ein Titel generiert werden kann. */
  public text: string = "";

  /** Fehlermeldung, die angezeigt wird, wenn der Titel nicht generiert werden kann. */
  public titelFehler: string = "";

  /** Flag um während KI-Abfrage den Button zu sperren. */
  public istTitelWirdGeradeGeneriert: boolean = false;


  /**
   * Konstruktor für *Dependency Injection*
   */
  constructor( private geminiService: GeminiService ) {}


  /**
   * Event-Handler für den Button "Titelvorschlag generieren".
   */
  async onButtonErzeugeTitelVorschlag(): Promise<void> {

    this.titelFehler                 = "";
    this.istTitelWirdGeradeGeneriert = true;

    const textTrimmed = this.text.trim();
    if ( textTrimmed.length === 0 ) {

      this.titelFehler = "Bitte zuerst Text eingeben, um einen Titelvorschlag zu generieren.";
      this.istTitelWirdGeradeGeneriert = false;
      return;
    }

    try {

      const titelArray = await this.geminiService.erzeugeTitelvorschlaege( textTrimmed );

      if ( titelArray.length === 0 ) {

        this.titelFehler = "Die KI konnte keinen Titelvorschlag generieren.";

      } else {

        this.titel = titelArray[0];
      }

    } catch ( fehler ) {

      this.titelFehler = "Fehler bei der Generierung des Titelvorschlags: " + fehler;

    } finally {

      this.istTitelWirdGeradeGeneriert = false;
    }
  }


}
