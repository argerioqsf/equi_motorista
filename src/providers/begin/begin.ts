
import { Injectable } from '@angular/core';
import { DadosProvider } from '../dados/dados';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthProvider } from '../../providers/auth/auth';
import { Insomnia } from '@ionic-native/insomnia';
import { LocalNotifications } from '@ionic-native/local-notifications';

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
              private localNotifications: LocalNotifications) {
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
                resolve("Erro");
              });
                                
          } else if(usuario.status.status == "stop" && that.authProvider.getUserp() == "vazio"){
            
            that.authProvider.setposition(usuario.DataHora);
            console.log("stop");
            that.authProvider.setUserp(usuario.viagens);
            that.authProvider.rejeitadosFim(that.user);
            //that.toast("setuserp 1" + usuario.viagens);
            that.authProvider.setstatus(true);
            resolve({status:usuario.status.status,
                      viagens:usuario.viagens,});
            
          }else{
            resolve("Erro");
          }
          
      },error =>{
        resolve("Erro");
      });
    });
    },500);

  }); 
  }

}
