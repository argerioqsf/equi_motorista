import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';
/*
  Generated class for the DadosProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DadosProvider {
	status = false;
    public profile: firebase.database.Reference;
    public eventListRef: firebase.database.Reference;
    public latlonr: firebase.database.Reference;
    public latlong: firebase.database.Reference = firebase.database().ref(`/latlon`);
    teste:any;
    latlng:any;
	user:any;
  constructor(public afDB: AngularFireDatabase) {
      
      //this.teste = this.afDB.list('latlon').valueChanges();
      //this.teste.subscribe(result => console.log('result',result));
      //this.teste.subscribe(result => console.log(this.latlng = result));
   firebase.auth().onAuthStateChanged(user => {
if (user) {

this.user = user.uid;
this.eventListRef = firebase.database().ref(`/DriverProfile/${user.uid}/latlon`);
this.latlonr = firebase.database().ref(`/latlon/${user.uid}`);
}
});
  }

  	getDriverProfile(){
    	return firebase.database().ref(`DriverProfile/`);
  	}
	
	pago(uid): Promise<any>{
		console.log("pago");
		return firebase.database().ref(`/viagens/${uid}`).update({val:"pago"});
	}

	pagoHisto(uid,id): Promise<any>{

			return firebase.database().ref(`/historicoPass/${uid}/${id}`).update({
				pago:true
				});

	}

	finalHisto(uid,id): Promise<any>{

		return firebase.database().ref(`/historicoPass/${uid}/${id}`).update({
			usert:this.user
			});

	}

	getHisto(uid,id){

		return firebase.database().ref(`/historicoPass/${uid}/${id}`);
	}

	stopHisto(uid,id){

		return firebase.database().ref(`/historicoPass/${uid}/${id}`).off;
	}

	setHisto(histo){

		return firebase.database().ref(`/historicoDriver/${this.user}`).push({user:histo.user,id:histo.id});
	}

	editHisto(uid,id,status){

		return firebase.database().ref(`/historicoPass/${uid}/${id}`).update({pago:status});
	}
	
	up(uid): Promise<any>{
		let status = 'aceito';
		let usert = this.user;
		if(uid != "vazio" ){
        return firebase.database().ref(`/viagens/${uid}`).update({usert: usert,
																 status: status});}

	}
	
	cancelEnd(uid,id): Promise<any>{
		
        let status = 'off';
		let usert = 'vazio';
        return firebase.database().ref(`/viagens/${uid}`).update({
								timed:null,
								latp: null,
								lonp: null,
								latd: null,
								lond: null,
								dist: null,
								tempo: null,
								obs:null,
								preco: null,
								status: status,
								user: uid,
								destino: null,
								myaddr: null,
								usert: usert
								}).then(()=>{

									firebase.database().ref(`/historicoPass/${uid}/${id}`).update({
										status: "finalizada",
										usert: this.user
										})

								});
		
		
	}
	
	cancel(uid): Promise<any>{
		
        let status = 'on';
		    let usert = 'vazio';
        return firebase.database().ref(`/viagens/${uid}`).update({
								status: status,
								usert: usert
								});
		
		
	}
	getuser(): Promise<any>{
   
      return new Promise((resolve, reject)=>{
        resolve(this.user);
      });
	}
	stopviagens(uid): firebase.database.Reference{
		
			return firebase.database().ref(`/viagens/${uid}`).off();
	}
	getviagens(uid): firebase.database.Reference{
		
		return firebase.database().ref(`/viagens/${uid}`);
	}
	
	stopUser(uid): firebase.database.Reference{
		
			return firebase.database().ref(`/userProfile/${uid}`).off();
	}
	getUsuario(uid): firebase.database.Reference{
		
		return firebase.database().ref(`/userProfile/${uid}`);
	}

	getDriver(uid): firebase.database.Reference{
		
		return firebase.database().ref(`/DriverProfile/${uid}`);
	}

	stopDriver(uid): firebase.database.Reference{
		
		return firebase.database().ref(`/DriverProfile/${uid}`).off();
	}
	
    latlon(lat:any,lon:any): Promise<any>{
		console.log("salvando lat lon2",lat,lon);
        return firebase.database().ref(`/DriverProfile/${this.user}/latlon`).update({
            lat:lat,
            lgn:lon
        });
        
    }
    dados(lat:any,lon:any): Promise<any> {
        return this.eventListRef.set({
            lat:lat,
            lgn:lon
        });
    }
    
    getlatlon(){
        return this.latlng;
        
    }
    
    getEventList():firebase.database.Reference {
        return this.eventListRef;
    }
    
    getEventDetail(eventId:string):firebase.database.Reference {
        return this.eventListRef.child(eventId);
    }   

}
