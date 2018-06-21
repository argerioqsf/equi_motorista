
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
      this.dadosprovider.getuser().then((user) =>{
        console.log("User, ", user);
        this.dadosprovider.getDriver(user).once("value", userProfileSnapshot => {
          let result = userProfileSnapshot.val();
          console.log("result " ,  result);
          let usuario:any = result;
            if(usuario.viagens == "vazio" ){
              if(usuario.status == "off"){
                this.authProvider.setposition(usuario.DataHora);//variavel compartilhada
                resolve({status:usuario.status,viagens:usuario.viagens});
              }else if(usuario.status.status == "go"){
                      this.authProvider.setposition(usuario.DataHora);//variavel compartilhada
                      this.authProvider.setstatus(true);//variavel compartilhada
                      this.authProvider.rejeitadosFim(user);
                      this.authProvider.stop(user);
                      resolve({status:usuario.status.status,viagens:usuario.viagens});
                    }else if(usuario.status.status == "stop"){
                            this.authProvider.setposition(usuario.DataHora);//variavel compartilhada
                            this.authProvider.setstatus(true);//variavel compartilhada
                            this.authProvider.rejeitadosFim(user);
                            resolve({status:usuario.status.status,viagens:usuario.viagens});
                          }else if(usuario.status.status == "aceito"){
                                  this.authProvider.setposition(usuario.DataHora);//variavel compartilhada
                                  this.authProvider.setstatus(true);//variavel compartilhada
                                  this.authProvider.rejeitadosFim(user);
                                  this.authProvider.stop(user);
                                  resolve({status:usuario.status.status,viagens:usuario.viagens});
                                }else{
                                    this.authProvider.setposition(usuario.DataHora);//variavel compartilhada
                                    console.log("Erro");
                                    resolve("Erro");
                                }
            }else if(usuario.status == "off"){
                    this.authProvider.setposition(usuario.DataHora);//variavel compartilhada
                    this.authProvider.rejeitar(user);
                    resolve({status:usuario.status});
                  }else if(usuario.status.status == "aceito"){
                          this.dadosprovider.getviagens(usuario.viagens).once("value", userProfileSnapshot => {
                            let viagem:any = userProfileSnapshot.val();
                            console.log("atualização/aceito");
                            if(viagem.user == usuario.viagens && usuario.viagens != "vazio" && viagem.usert == usuario.id){
                              console.log("status viagem: ",viagem.status);
                              this.insomnia.keepAwake().then(
                                () => console.log('success/insomnia'),
                                () => console.log('error/insomnia')
                              );
                              this.authProvider.setAceito(true);//variavel compartilhada
                              this.authProvider.setposition(usuario.DataHora);//variavel compartilhada
                              let userPass = usuario.viagens;
                              this.authProvider.setUserp(usuario.viagens);//variavel compartilhada
                              this.authProvider.setstatus(true);//variavel compartilhada
                              this.localNotifications.clear(1);
                              let info = viagem;
                              let latlon = {lat:info.latd,lgn:info.lond};
                              let way = {lat:info.latp,lgn:info.lonp};
                              console.log('way ' + way + 'latlon ' + latlon);  
                              resolve({status:usuario.status.status,
                                      viagens:usuario.viagens,
                                      info:info,
                                      userPass: userPass,
                                      latlon: latlon,
                                      way:way});
                            }else{
                                this.authProvider.setposition(usuario.DataHora);//variavel compartilhada
                                this.authProvider.rejeitadosFim(user);
                                this.authProvider.setstatus(true);//variavel compartilhada
                                this.authProvider.stop(user);
                                this.authProvider.rejeitar(user);
                                resolve({status:"Erro/indisponivel"});
                            }
                          },error=>{
                                console.log("Erro: ",error);
                                resolve("Erro");
                            });   
                        }else if(usuario.status.status == "go"){
                                this.dadosprovider.getviagens(usuario.viagens).once("value", userProfileSnapshot => {
                                    let viagem:any = userProfileSnapshot.val();
                                    console.log("atualização/go");
                                    if(viagem.user == usuario.viagens && usuario.viagens != "vazio" && viagem.usert == usuario.id){
                                        console.log("status viagem ",viagem.status.status);
                                        this.insomnia.keepAwake().then(
                                          () => console.log('success/insomnia'),
                                          () => console.log('error/insomnia')
                                        );
                                        let userPass = usuario.viagens;
                                        this.authProvider.setAceito(true);//variavel compartilhada
                                        this.authProvider.setposition(usuario.DataHora);//variavel compartilhada
                                        this.authProvider.setUserp(usuario.viagens);//variavel compartilhada
                                        this.authProvider.setstatus(true);//variavel compartilhada
                                        this.localNotifications.clear(1);
                                        let info = viagem;
                                        let latlon = {lat:info.latd,lgn:info.lond};
                                        let way = {lat:info.latp,lgn:info.lonp};
                                        console.log('way ' + way + 'latlon ' + latlon);
                                        resolve({status:usuario.status.status,
                                                viagens:usuario.viagens,
                                                info:info,
                                                userPass: userPass,
                                                latlon: latlon,
                                                way:way});
                                    }else{
                                        this.authProvider.setposition(usuario.DataHora);//variavel compartilhada
                                        this.authProvider.rejeitadosFim(user);//variavel compartilhada
                                        this.authProvider.setstatus(true);//variavel compartilhada
                                        this.authProvider.stop(user);
                                        this.authProvider.rejeitar(user);
                                        resolve({status:"Erro/indisponivel"});
                                    }
                                },error=>{
                                    console.log("Erro: ",error);
                                    resolve("Erro");
                                  });       
                              }else if(usuario.status.status == "stop" && this.authProvider.getUserp() == "vazio"){
                                      this.dadosprovider.getviagens(usuario.viagens).once("value", userProfileSnapshot => {
                                          let viagem:any = userProfileSnapshot.val();
                                          console.log("atualização/stop");
                                          if(viagem.user == usuario.viagens && usuario.viagens != "vazio" && viagem.usert == usuario.id){
                                            console.log("status viagem ",viagem.status.status);
                                            this.authProvider.setposition(usuario.DataHora);//variavel compartilhada
                                            this.authProvider.setUserp(usuario.viagens);//variavel compartilhada
                                            this.authProvider.setstatus(true);//variavel compartilhada
                                            this.authProvider.rejeitadosFim(user);
                                            resolve({status:usuario.status.status,
                                                      viagens:usuario.viagens,});
                                          }else{
                                              this.authProvider.setposition(usuario.DataHora);//variavel compartilhada
                                              this.authProvider.rejeitadosFim(user);//variavel compartilhada
                                              this.authProvider.setstatus(true);//variavel compartilhada
                                              this.authProvider.rejeitar(user);
                                              resolve({status:"Erro/indisponivel"});
                                          }
                                      },error=>{
                                            console.log("Erro: ", error);
                                            resolve("Erro");
                                        });
                  
                                    }else{
                                      console.log("Erro");
                                      resolve("Erro");
                                    }
                  
          
        },error =>{
              console.log("Erro: ", error);
              resolve("Erro");
          });
      });
    }); 
  }

  StatusViagem(userPass,status){
    return new Promise((resolve,reject) => {
      this.dadosprovider.getviagens(userPass).once("value", (userProfileSnapshot:any) =>{
        let viagem = userProfileSnapshot.val();
        this.dadosprovider.getuser().then(user=>{
          if(viagem.status  != "off" && viagem.usert == user){
            if(viagem.status == status){
              if(this.authProvider.getstatus()  == true){
                resolve({status:"OK"});
              }else{
                resolve({status:"Erro"});
              }
            }else{
              resolve({status:"Erro/status"});
            }
          }else{
             resolve({status:"Erro"});
          }
        });
      },error=>{
        console.log("Error/StatusViagem: ",error);
        resolve({status:"Erro"});
        });
    });          
  }

  NewCorrida(){
      let observable = new Observable(observer => { 
        this.dadosprovider.getuser().then((user) =>{
		      this.dadosprovider.getDriver(user).on("value", userProfileSnapshot => {
			      let driver:any = userProfileSnapshot.val();
			      if(this.authProvider.getstatus()  == true){
					    if(this.authProvider.getAceito() == false){
						    if(driver.viagens != "vazio" && driver.status != "off"){
						      if(driver.status.status == "stop"){
                    this.authProvider.setUserp(driver.viagens);//variavel compartilhada
                    observer.next({info:"new",userPass: driver.viagens});
							    }
					      }                        
					    }
			      }
          },error=>{
                console.log("Error/statusCorrida: ",error);
                observer.next({info:"Erro"});
          });
        });
      });
      return observable;
  }

  getInfo(userPass){
    return new Promise((resolve,reject) => {
    this.dadosprovider.getviagens(userPass).once("value", (userProfileSnapshot:any) =>{
      let viagem = userProfileSnapshot.val();
      if(viagem.status  == "on" || viagem.status  == "enviado"){
        if(this.authProvider.getstatus() == true){
          console.log("viagem nova ",viagem);
          //this.navCtrl.popAll();
          this.localNotifications.schedule({
            id: 1,
            text: 'solicitação de viagem para:' + viagem.destino,
            icon:'../src/assets/images/icon4.png',
            color: 'FFFF00'
          });
          this.audio.play('tabSwitch');	
          this.vibration.vibrate([5000,5000,5000]);
          resolve({status:"OK",result:viagem});
        }else{
          resolve({status:"Erro/getstatus"});
         }
      }else{
        console.log("viagem não está disponivel ");
        this.dadosprovider.getuser().then(user=>{
          this.authProvider.stop(user);
          this.authProvider.rejeitar(user);
        });
        resolve({status:"Erro/nao_e_on"});
      }
    },error=>{
        console.log("Error/getInfo: ",error);
        resolve({status:"Erro/getviagens/getInfo"});
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
						() => console.log('success/insomnia'),
						() => console.log('error/insomnia')
          );
          this.authProvider.setUserp("vazio");//variavel compartilhada
					this.localNotifications.clear(1);
          this.vibration.vibrate(0);
          this.localNotifications.schedule({
						id: 1,
						text: 'O usuario cancelou a viagem',
						icon:'../src/assets/images/icon4.png',
						color: 'FFFF00'
          });
          this.dadosprovider.getuser().then(usert=>{
            this.authProvider.stop(usert);
          });
          this.dadosprovider.stopUser(user.user);
          this.dadosprovider.stopviagens(user.user);
          this.authProvider.setAceito(false);//variavel compartilhada
          observer.next({status:"off"});
        }else{
          observer.next({status:userProfileSnapshot.val().status});
        }
      },error=>{
        console.log("Error/getuser: ",error);
        observer.next({status:"Erro"});
      });
    });

    return observable
	}

}
