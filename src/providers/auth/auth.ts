import {Injectable} from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import firebase from 'firebase';
@Injectable()

export class AuthProvider {

ver = "1.2.20";
notificado = false;
status = false;
position:any = "off";
cont = 0;
userp = "vazio";  
image;
name;
aceito = false;
constructor(private afDB:AngularFireDatabase) {}

  atualizar_versao(user){
    firebase.database().ref(`/DriverProfile/${user}/ver`).set(this.ver);
  }

  rejeitar(user): Promise<any>{
        
		this.setUserp("vazio");
        
		return firebase.database().ref(`/DriverProfile/${user}`).update({viagens:"vazio"});
        
	}

	getVer(){
		return this.ver;
	}
	Ocupado(not){
		this.notificado = not;
	}
	getNot(){
		return this.notificado;
	}
	setAceito(aceito){
		this.aceito = aceito;
	}
	getAceito(){
		return this.aceito;
	}
	setUserp(userp){
		this.userp = userp;
	}
	getUserp(){
		return this.userp;
	}
	setposition(posi){
		
		this.position = posi;
	}
	stop(user): Promise<any>{
        
		return firebase.database().ref(`/DriverProfile/${user}/status`).update({status:"stop"});
        
	}
	
	rejeitados(userp,user): Promise<any>{
		
		return firebase.database().ref(`/DriverProfile/${user}/rejeitados`).set(userp);
		
	}
	rejeitadosFim(user): Promise<any>{
		
		return firebase.database().ref(`/DriverProfile/${user}/rejeitados`).set("vazio");
		
	}
	rejeitarV(): Promise<any>{
		if(this.userp != "vazio"){
		return firebase.database().ref(`/viagens/${this.userp}`).update({status:"on"});}
	}
	go(user): Promise<any>{
		firebase.database().ref(`/DriverProfile/${user}/status`).update({status:"go"});
		return firebase.database().ref(`/viagens/${this.userp}`).update({status:"go"});
	}
	driveron(cont,user,hora,min,ano,mes,dia): Promise<any>{
		this.position = cont;
		let viagens = "vazio";
		let status = "stop";
		if(this.aceito == true){
			status = "go";
		}
		if(this.userp != "vazio"){
			viagens = this.userp;
		}
		return firebase.database().ref(`/DriverProfile/${user}`).update({
                                    DataHora:cont,
																		status:{hora:hora,
                                            min:min,
                                            status:status,
                                            ano:ano,
                                            mes:mes,
                                            dia:dia},
																		viagens:viagens,
																		rejeitados:"vazio",
																		ver:this.ver});
	}
	descer(dt,user,userp): Promise<any>{
		this.position = dt;
        firebase.database().ref(`/DriverProfile/${user}/status`).update({status:"aceito"});
		return firebase.database().ref(`/DriverProfile/${user}`).update({DataHora:dt});
	}
	driveroff(user): Promise<any>{
		return firebase.database().ref(`/DriverProfile/${user}`).update({status:"off",
																   				  viagens:"vazio"});
	}
	contOff(cont): Promise<any>{
		return firebase.database().ref(`/DriverProfile/cont`).set(cont);
	}
    setStatus(hora,min,ano,mes,dia,user): Promise<any>{
		
		return firebase.database().ref(`/DriverProfile/${user}/status`).update({hora:hora,
																				min:min,
																				ano:ano,
																				mes:mes,
																				dia:dia});
	}
	getData(){
		let ano:any = new Date().getFullYear();
		let mes:any = new Date().getMonth() + 1;
		let dia:any = new Date().getDate();
		let horas:any = new Date().getHours();
		let minutos:any = new Date().getMinutes();
		let segundos:any = new Date().getSeconds();
		
			if(mes < 10){
				mes = "0" + mes;
			}
			if(dia < 10){
				dia = "0" + dia;
			}
			if(horas < 10){
				horas = "0" + horas;
			}
			if(minutos < 10){
				minutos = "0" + minutos;
			}
			if(segundos < 10){
				segundos = "0" + segundos;
			}
		
		let dataNow = ano + mes + dia + horas + minutos + segundos;
		return dataNow;
	}
    
    DataHora(){
		let ano:any = new Date().getFullYear();
		let mes:any = new Date().getMonth() + 1;
		let dia:any = new Date().getDate();
		let horas:any = new Date().getHours();
		let minutos:any = new Date().getMinutes();
		let segundos:any = new Date().getSeconds();
		
			if(mes < 10){
				mes = "0" + mes;
			}
			if(dia < 10){
				dia = "0" + dia;
			}
			if(horas < 10){
				horas = "0" + horas;
			}
			if(minutos < 10){
				minutos = "0" + minutos;
			}
			if(segundos < 10){
				segundos = "0" + segundos;
			}
		
		let dataNow = ano + mes + dia + horas + minutos + segundos;
		return dataNow;
	}
	getPosition(){
		return this.position;
	}
	getstatus(){
		
		return this.status;
	}
	setstatus(status){
		this.status = status;
	}
	
	imageUp(image): Promise<any> {
		console.log("iamge: ", image)
      return firebase.database().ref(`/DriverProfile/${image.user}`).update({image:image.image,
		      														       imageuid:image.imageuid});
	}
	  
	imageUpCar(image): Promise<any> {
		return firebase.database().ref(`/DriverProfile/${image.user}/carro`).update({imagecar:image.image});
	}  
	
	delImage(image):Promise<any>{
		
		return firebase.storage().refFromURL(image).delete().then(function() {
  			
		}).catch(function(error) {
  			
		});
		
	}
	
    
  loginUser(email: string, password: string): Promise<any> {
    
		return firebase.auth().signInWithEmailAndPassword(email, password);
}
  
 signupUser(singup): Promise<any> {
      return firebase.auth().createUserWithEmailAndPassword(singup.email, singup.senha).then(newUser => {
          firebase.database().ref(`/DriverProfile/${newUser.uid}`).set({email:singup.email,
																	  image:singup.image,
																	  carro:{
																		  modelo:singup.modelo,
																		  placa:singup.placa,
																		  imagecar:singup.imageCar
																	  },
																	  telefone:singup.telefone,
																	  codigo:singup.codigo,
		      														  imageuid:singup.imageuid,
																	  tipo:"driver",
																	  lastName:singup.lastname,
																	  firstName:singup.firstname,
                                                                      id:newUser.uid,
                                                                      DataHora:this.DataHora(),
                                                                      status:"off",
                                                                      viagens:"vazio",
                                                                      rejeitados:"vazio",
																	  latlon:0,
																	  ver:this.ver
                                                                      });
      });
  }
    resetPassword(email:string):Promise<void> {
        return firebase.auth().sendPasswordResetEmail(email);
    }
    
  logoutUser(): Promise<void> {
      const userId: string = firebase.auth().currentUser.uid;
      firebase
          .database()
          .ref(`/userProfile/${userId}`)
          .off();
      return firebase.auth().signOut();
  }
    

}