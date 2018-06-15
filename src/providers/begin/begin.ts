
import { Injectable } from '@angular/core';
import { DadosProvider } from '../dados/dados';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthProvider } from '../../providers/auth/auth';
import { Insomnia } from '@ionic-native/insomnia';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Observable } from 'rxjs/Observable';
//import { NavController } from 'ionic-angular';
import { AudioProvider } from '../audio/audio';
import { Vibration } from '@ionic-native/vibration';

/*
  Generated class for the BeginProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BeginProvider {

  modo: any;
  driveron: any;
  driveron2: any; 
  user: any;
  bandeira: any;
  refviagens2: any;
  constructor(
              private dadosprovider: DadosProvider,
              private afDB: AngularFireDatabase,
              private authProvider: AuthProvider,
              private insomnia: Insomnia,
              private localNotifications: LocalNotifications,
              //private navCtrl: NavController,
              private audio: AudioProvider,
              private vibration: Vibration) {
    console.log('Hello BeginProvider Provider');
  }

  begin(){
    return new Promise((resolve,reject)=>{
    let that = this;
    setTimeout(()=>{
    that.user = that.dadosprovider.getuser().then((user) =>{
      console.log("User, ", user);
      that.dadosprovider.getDriver(user).once("value", userProfileSnapshot => {
        let result = userProfileSnapshot.val();
        console.log("result " ,  result);
        let usuario:any = result;

        if(usuario.viagens == "vazio" ){

          if(usuario.status == "off"){
            that.authProvider.setposition(usuario.DataHora);
            resolve({status:usuario.status,viagens:usuario.viagens});
          }else  if(usuario.status.status == "go"){
                    resolve({status:usuario.status.status,viagens:usuario.viagens});
                 }else if(usuario.status.status == "stop"){
                          that.authProvider.setposition(usuario.DataHora);
                          that.authProvider.setstatus(true);
                          that.authProvider.rejeitadosFim(user);
                          resolve({status:usuario.status.status,viagens:usuario.viagens});
                       }else if(usuario.status.status == "aceito"){
                          resolve({status:usuario.status.status,viagens:usuario.viagens});
                                }else{
                                  console.log("Erro");
                                  resolve("Erro");
                                }
                        
        }else  if(usuario.status.status == "aceito"){

            that.insomnia.keepAwake()
            .then(
              () => console.log('success'),
              () => console.log('error')
            );

            //that.toast("go: ");
            that.authProvider.setAceito(true);
            that.authProvider.setposition(usuario.DataHora);
            let userPass = usuario.viagens;
            that.authProvider.setUserp(usuario.viagens);
            that.authProvider.setstatus(true);
            that.localNotifications.clear(1);
          
            that.dadosprovider.getviagens(usuario.viagens).once("value", userProfileSnapshot => {
              let result2:any = userProfileSnapshot.val();

                console.log("atualização");

                    if(result2.user == usuario.viagens && usuario.viagens != "vazio"){

                      console.log("status viagem ",result2.status);

                      that.authProvider.setAceito(true);
                      let info = result2;
                      let latlon = {lat:info.latd,lgn:info.lond};
                      let way = {lat:info.latp,lgn:info.lonp};
                      console.log('way ' + way + 'latlon ' + latlon);  
                      resolve({status:usuario.status.status,
                               viagens:usuario.viagens,
                               info:info,
                               userPass: userPass,
                               latlon: latlon,
                               way:way});
                      }
               
               },error=>{
                 console.log("Erro");
                 resolve("Erro");
               });
                                
        }else if(usuario.status.status == "go"){

            that.insomnia.keepAwake()
            .then(
              () => console.log('success'),
              () => console.log('error')
            );

            that.authProvider.setAceito(true);
            that.authProvider.setposition(usuario.DataHora);
            let userPass = usuario.viagens;
            that.authProvider.setUserp(usuario.viagens);
            that.authProvider.setstatus(true);
            that.localNotifications.clear(1);
            //that.cronometro();
          
            that.dadosprovider.getviagens(usuario.viagens).once("value", userProfileSnapshot => {
              let result2:any = userProfileSnapshot.val();
                         // that.toast("refviagens2");
              if(that.authProvider.getstatus()  == true){

                console.log("atualização");

                    if(result2.user == userPass && userPass != "vazio"){

                      console.log("status viagem ",result2.status.status);

                      that.authProvider.setAceito(true);
                      let info = result2;
                    
                      let latlon = {lat:info.latd,lgn:info.lond};
                      let way = {lat:info.latp,lgn:info.lonp};
                      console.log('way ' + way + 'latlon ' + latlon);
                      resolve({status:usuario.status.status,
                               viagens:usuario.viagens,
                               info:info,
                               userPass: userPass,
                               latlon: latlon,
                               way:way});
                      }
               }
               },error=>{
                 console.log("Erro");
                resolve("Erro");
              });
                                
          } else if(usuario.status.status == "stop" && that.authProvider.getUserp() == "vazio"){
            
            that.authProvider.setposition(usuario.DataHora);
            console.log("stop");
            that.authProvider.setUserp(usuario.viagens);
            that.authProvider.rejeitadosFim(user);
            //that.toast("setuserp 1" + usuario.viagens);
            that.authProvider.setstatus(true);
            resolve({status:usuario.status.status,
                      viagens:usuario.viagens,});
            
          }else{
            console.log("Erro");
            resolve("Erro");
          }
          
      },error =>{
        console.log("Erro");
        resolve("Erro");
      });
    });
    },500);

  }); 
  }

  statusCorrida(){
    let that = this;
    let observable = new Observable(observer => { 
  setTimeout(() => {
      that.user = that.dadosprovider.getuser().then((user) =>{
		      that.dadosprovider.getDriver(user).on("value", userProfileSnapshot => {
			      let result:any = userProfileSnapshot.val();
            
			      if(that.authProvider.getstatus()  == true){
                
				    console.log("result driveron ",result);
					
					  if(that.authProvider.getAceito() == false){
					     
						console.log("result[i].id ",result.id);
						console.log("user ",that.user);
						console.log("resulti user ",result.id);
                      
						console.log("userPass antes ",result.viagens);
                        
						let userPass = "vazio";
                        
						if(result.viagens != "vazio" && result.status != "off"){
							
						    if(result.status.status != "go" && result.status.status != "aceito"){
                  observer.next({info:"new",userPass: result.viagens});
							  }
					  }                        
					}
			}
    });
  });
}, 500);
});
  return observable;
  }

  getInfo(userPass){
    return new Promise((resolve,reject) => {
    this.dadosprovider.getviagens(userPass).once("value", (userProfileSnapshot:any) =>{
      let result = userProfileSnapshot.val();
      if(this.authProvider.getstatus()  == true){
        console.log("result ",result);
        //this.navCtrl.popAll();
        this.authProvider.Ocupado(true);
        this.localNotifications.schedule({
          id: 1,
          text: 'solicitação de viagem para:' + result.destino,
          icon:'../assets/images/icon4.png',
          color: 'FFFF00'
        });
        this.audio.play('tabSwitch');	
        this.vibration.vibrate([5000,5000,5000]);
        resolve({status:"OK",result:result});
      }else{
        resolve({status:"Erro"});
      }
    },error=>{
      resolve({status:"Erro"});
    });
  });          
  }

  getuser(user){
    let observable = new Observable(observer => { 
      this.dadosprovider.getviagens(user.user).on("value", userProfileSnapshot => {
        if(userProfileSnapshot.val().status == "off"){
          this.audio.stop('tabSwitch');
          this.insomnia.allowSleepAgain()
					.then(
						() => console.log('success'),
						() => console.log('error')
          );
          this.authProvider.setUserp("vazio");
					this.localNotifications.clear(1);
          this.vibration.vibrate(0);
          this.localNotifications.schedule({
						id: 1,
						text: 'O usuario cancelou a viagem',
						icon:'../assets/images/icon4.png',
						color: 'FFFF00'
					});
					this.authProvider.stop(this.user);
          this.authProvider.Ocupado(false);
          this.dadosprovider.stopUser(user.user);
          this.dadosprovider.stopviagens(user.user);
          this.authProvider.setAceito(false);
          observer.next({status:"off"});
        }else{
          observer.next({status:userProfileSnapshot.val().status});
        }
      },error=>{
        observer.next({status:"Erro"});
      });
    });

    return observable
	}

}
