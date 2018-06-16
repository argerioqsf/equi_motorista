import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { DadosProvider } from "../../providers/dados/dados";
import { BackgroundMode } from '@ionic-native/background-mode';
import { Platform, ViewController } from 'ionic-angular';
import firebase from 'firebase';
/**
 * Generated class for the SviagensPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sviagens',
  templateUrl: 'sviagens.html',
})
export class SviagensPage {

  histo;

  temp = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public afDB: AngularFireDatabase,
              public dadosprovider: DadosProvider,
              public alertCtrl: AlertController,
              public viewCtrl: ViewController,
              public platform: Platform,
              private backgroundMode: BackgroundMode) {

  this.dadosprovider.getuser().then(user=>{
   this.dadosprovider.returnList(`/historicoDriver/${user}`).then(resp=>{
    this.histo = resp
    this.histos(this.histo);
   });
    
  
    this.platform.ready().then(() => {
      this.platform.registerBackButtonAction(() => {
  
        if(!this.viewCtrl.enableBack()) { 
          
          this.backgroundMode.moveToBackground();
  
         }else{
  
          this.navCtrl.pop();
  
         } 
        });
      });
  }); 
  


  }

  histos(histo){
    if(histo != "Erro"){
      console.log("result : " , histo);
      let cont = 0;
      console.log("result : " , histo);
      console.log("result[0] : " , histo[0]);
      console.log("result length: " , histo.length);

      for(var i = 0; i < histo.length; i++){
            
        console.log(i ," user id", histo[i].user, " ", histo[i].id );

        this.dadosprovider.getHisto(histo[i].user,histo[i].id).once("value", userProfileSnapshot => {
          cont++;
          
          let result2 = userProfileSnapshot.val();
          
          console.log("result2 ", result2);

          this.temp.push(result2);
          if(cont == histo.length){
            console.log("temp ", this.temp);
            this.organizar();
          }

        });
      }
    }else{
      let alert = this.alertCtrl.create({
        title:"Ocorreu um erro inesperado.",
        subTitle:"Deseja carregar o seu histórico novamente?",
        buttons: [
          {
            text: 'sim',
            handler: () => {
              this.dadosprovider.getuser().then(user=>{
              this.dadosprovider.returnList(`/historicoDriver/${user}`).then(resp=>{
              this.histo = resp
              this.histos(this.histo);
              });});
          }},{
            text: 'não',
            handler: () => {}
          }
            ]
        });
        alert.present();
    }
      
}

organizar(){

    console.log("organizar");
    for(var j = 0; j < this.temp.length; j++){

      let temp;

      ////console.log(i,"-","DataHora antes: ",result[i].DataHora);

      for(var k = j+1; k < this.temp.length; k++){
        
        ////console.log("i: ",i,", se ", result[i].DataHora ," é menor que: ",result[j].DataHora);

        if( this.temp[j].id < this.temp[k].id){

          temp = this.temp[j];
          ////console.log(temp);
          this.temp[j] = this.temp[k]; 	
          this.temp[k]= temp;
          ////console.log(this.motors2);

        }
      }
    }
    console.log("temp2 ", this.temp);
  }

  editar(item){

    let alert = this.alertCtrl.create();
			alert.setTitle('Status de pagamento da viagem.');

			alert.addInput({
			  type: 'radio',
			  label: 'Pagamento efetuado',
			  value: '1',
			  checked: item.pago
			});
		    
		    alert.addInput({
			  type: 'radio',
			  label: 'Pagamento pendente',
			  value: '2',
			  checked: !item.pago
			});

			alert.addButton('Cancel');
			alert.addButton({
			  text: 'OK',
			  handler: data => {
          if(data == '1'){
            this.dadosprovider.editHisto(item.user,item.id,true);
            for(var j = 0; j < this.temp.length; j++){
              if(item.id == this.temp[j].id){
                  this.temp[j].pago = true;
              }
            }
          }
          if(data == '2'){
            this.dadosprovider.editHisto(item.user,item.id,false);
            for(var j = 0; j < this.temp.length; j++){
              if(item.id == this.temp[j].id){
                  this.temp[j].pago = false;
              }
            }
          }
				  
			  }
			});
			alert.present();

  }

 
}
