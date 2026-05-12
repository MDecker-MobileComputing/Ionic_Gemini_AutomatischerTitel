import { Component } from '@angular/core';
import Denque     from "denque";
import { AlertController } from '@ionic/angular';

import { GeminiService }           from '../gemini-service';
import { extrahiereFehlermeldung } from '../fehlertext.util';


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

  /** Warteschlange für Titelvorschläge. */
  private titelQueue = new Denque<string>();


  /**
   * Konstruktor für *Dependency Injection*
   */
  constructor( private geminiService: GeminiService,
               private alertController: AlertController ) {}

  /**
   * Event-Handler für Änderungen im Text-Editor. Hiermit werden die Titelvorschläge 
   * in der Warteschlange gelöscht, da sie sich ja auf den alten Text beziehen und 
   * damit nicht mehr gültig sind.
   */
  public onTextChanged() {

    this.titelQueue.clear();
    console.log( "Text geändert, lösche Warteschlagen." );    
  }


  /**
   * Event-Handler für den Button "Titelvorschlag generieren".
   */
  async onButtonErzeugeTitelVorschlag(): Promise<void> {

    this.titelFehler                 = "";
    this.istTitelWirdGeradeGeneriert = true;

    const textTrimmed = this.text.trim();
    if ( textTrimmed.length === 0 ) {

      this.titelFehler                 = "Bitte zuerst Text eingeben, um einen Titelvorschlag zu generieren.";
      this.istTitelWirdGeradeGeneriert = false;
      return;
    }


    // abfragen, ob Warteschlange schon Titelvorschläge enthält 
    if ( this.titelQueue.length > 0 ) {

      this.titel                       = this.titelQueue.shift() ?? "";
      this.istTitelWirdGeradeGeneriert = false;
      
      console.log( `Titelvorschlag aus Warteschlange genommen, es sind jetzt noch ${this.titelQueue.length} übrig.` );

    } else {

      console.log( "Warteschlange leer, lasse von KI neue Titelvorschläge erzeugen ..." );

      try {

        const titelArray = await this.geminiService.erzeugeTitelvorschlaege( textTrimmed );
        if ( titelArray.length === 0 ) {

          this.titelFehler = "Die KI konnte keine Titelvorschläge erzeugen.";

        } else {

          // Elemente aus TitelArray in titleQueue einfügen
          titelArray.forEach( (titel) => this.titelQueue.push( titel ) );

          // ersten Titelvorschlag aus der Warteschlange entnehmen und anzeigen
          this.titel = this.titelQueue.shift() ?? "";

          console.log( `Neue Titel erzeugt, jetzt sind ${this.titelQueue.length} in Warteschlange.` );
        }

      } catch ( fehler ) {

        this.titelFehler = 
            "Fehler bei der Generierung des Titelvorschlags: " + 
            extrahiereFehlermeldung( fehler );

      } finally {

        this.istTitelWirdGeradeGeneriert = false;
      }
    }
  }


  /**
   * Event-Handler für den "Lösch"-Button: Löscht Titel- und Textfeld sowie
   * die Warteschlange mit Titelvorschlägen.
   */
  public async onButtonLoeschen(): Promise<void> {

    const alert = await this.alertController.create({
      header: "Löschen bestätigen",
      message: "Titel und Titelvorschläge wirklich löschen?",
      buttons: [
        {
          text: "Abbrechen",
          role: "cancel"
        },
        {
          text: "Löschen",
          role: "destructive",
          handler: () => {
            this.titel = "";
            this.text  = "";
            this.titelQueue.clear();
          }
        }
      ]
    });

    await alert.present();
  }

}
