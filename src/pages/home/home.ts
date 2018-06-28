import { Component } from '@angular/core';
import { NavController, AlertController, ToastController, Loading,
	     LoadingController, MenuController, Platform, ViewController  } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { DadosProvider } from "../../providers/dados/dados";
import { AngularFireDatabase } from 'angularfire2/database';
import { LocalNotifications } from '@ionic-native/local-notifications';//FAZER PROVIDER PARA TRATAR DO lOCALNOTIFICATIONS
import { AuthProvider } from '../../providers/auth/auth';
import { AudioProvider } from '../../providers/audio/audio';
import { BackgroundMode } from '@ionic-native/background-mode';//FAZER PROVIDER PARA TRATAR DO BACKGROUND
import { Insomnia } from '@ionic-native/insomnia';
import { Vibration } from '@ionic-native/vibration';
import { BeginProvider } from '../../providers/begin/begin';
import { PagamentoProvider } from '../../providers/pagamento/pagamento';
declare var google;


@Component({
  selector: 'page-home',
  templateUrl: 'home.html' 
})
export class HomePage {

disTime:any = false;
cronom = 0;
cronoh = 0;	
cronomt = "0";
cronoht = "0";
cronos = 0;	
cronost = "0";

velocidade:number = 0;	
colorloc = 'light';
display = true;
velo;
corrida = false;
inicial = 0;
map:any;
lat:any = 0.0;
lon:any = 0.0;
accuracy:any;
markers: any;
ocupado = false;
user:any;
info:any = {};
passageiro:any = {};
userPass = "vazio";
bandeira;
modo;
public loading: Loading;
directionsService = new google.maps.DirectionsService;
directionsDisplay = new google.maps.DirectionsRenderer;
	
  constructor(public platform: Platform,
	  		      public navCtrl: NavController,
              private geolocation: Geolocation,
              public dadosprovider: DadosProvider,
              public afDB: AngularFireDatabase,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              private localNotifications: LocalNotifications,
              public authProvider: AuthProvider,
              public loadingCtrl: LoadingController,
              public audio: AudioProvider,
              private backgroundMode: BackgroundMode,
              public menuCtrl: MenuController,
              private insomnia: Insomnia,
              private vibration: Vibration,
              public viewCtrl: ViewController,
              private begin: BeginProvider,
              private pagamento: PagamentoProvider) {
      
     console.log("................construtor......................");
    ///////////iNICIO CONSTRUTOR///////////////////////
	  this.platform.ready().then(() => {
		  this.platform.registerBackButtonAction(() => {
		  if(!this.viewCtrl.enableBack()) { 
			    this.backgroundMode.moveToBackground();
	    }else{
      this.navCtrl.pop();
      }})});
    this.ColorStatus();
    this.bandeira = this.afDB.object(`/bandeira`).valueChanges();
    this.bandeira.subscribe( result => {
      this.modo = result.modo;
    });
    this.beginer();
	  ///////////FIM CONSTRUTOR///////////////////////
  }
    ///////////INICIO BEGINER///////////////////////
  beginer(){
    this.begin.begin().then((resp:any) =>{
      console.log("resp/beginer: ", resp);
      if(resp == "Erro"){
        let alert1 = this.alertCtrl.create({
          title: 'Ocorreu um erro inesperado.',
          subTitle:'Deseja tentar Novamente?',
          buttons: [{text: 'sim',handler: () => {this.beginer()}},{text: 'não',handler: () => {}}]
        });
        alert1.present();
      }else if(resp.viagens == "vazio"){
              console.log("viagens vazio");
              this.NewCorrida();
            }else if(resp.status == "off"){
                    console.log("off/viagensNaoVazio");
                  }else if(resp.status == "aceito"){
                          this.begin.StatusViagem(resp.userPass,resp.status).then((statusV:any)=>{
                            if(statusV.status == "OK"){
                              this.userPass = resp.userPass;
                              this.info = resp.info;
                              this.ocupado = true;
                              this.directionsDisplay.setMap(this.map);
                              this.calculateAndDisplayRoute(resp.latlon,resp.way);  
                              this.NewCorrida();
                              this.getuser(resp.info);
                              this.getUsuario(resp.info);
                            }else if(statusV.status == "Erro/status"){
                                    let alert1 = this.alertCtrl.create({
                                      title: 'Ocorreu um erro de Sincronização.',
                                      subTitle:'Pessa para o passgeiro reinviar a solicitação de viagem.',
                                      buttons: ["OK"]
                                    });
                                    alert1.present();
                                    console.log("Erro de Sincronização.");
                                    this.dadosprovider.getuser().then(user=>{
                                      this.authProvider.stop(user);
                                      this.authProvider.rejeitar(user);
                                    });
                                  }else{
                                    let alert1 = this.alertCtrl.create({
                                      title: 'Ocorreu um erro Inesperado.',
                                      subTitle:'Reinicie o aplicativo.',
                                      buttons: ["OK"]
                                    });
                                    alert1.present();
                                    console.log("Erro de Sincronização.");
                                    this.dadosprovider.getuser().then(user=>{
                                      this.authProvider.stop(user);
                                      this.authProvider.rejeitar(user);
                                    });
                                  }
                          });
                        }else if(resp.status == "go"){
                                this.begin.StatusViagem(resp.userPass,resp.status).then((statusV:any)=>{
                                  if(statusV.status == "OK"){
                                    this.toast("Corrida já iniciada. ");
                                    this.userPass = resp.userPass;
                                    this.info = resp.info;
                                    this.ocupado = true;
                                    this.corrida = true; //so é true se a corrida já estiver iniciada
                                    this.directionsDisplay.setMap(this.map);
                                    this.calculateAndDisplayRoute(resp.latlon,resp.way);
                                    this.NewCorrida();
                                    this.getuser(resp.info);
                                    this.getUsuario(resp.info);
                                  }else if(statusV.status == "Erro/status"){
                                    let alert1 = this.alertCtrl.create({
                                      title: 'Ocorreu um erro de Sincronização.',
                                      subTitle:'Pessa para o passgeiro reinviar a solicitação de viagem.',
                                      buttons: ["OK"]
                                    });
                                    alert1.present();
                                    console.log("Erro de Sincronização.");
                                    this.dadosprovider.getuser().then(user=>{
                                      this.authProvider.stop(user);
                                      this.authProvider.rejeitar(user);
                                    });
                                  }else{
                                    let alert1 = this.alertCtrl.create({
                                      title: 'Ocorreu um erro Inesperado.',
                                      subTitle:'Reinicie o aplicativo.',
                                      buttons: ["OK"]
                                    });
                                    alert1.present();
                                    console.log("Erro de Sincronização.");
                                    this.dadosprovider.getuser().then(user=>{
                                      this.authProvider.stop(user);
                                      this.authProvider.rejeitar(user);
                                    });
                                  }
                                });
                                }else if(resp.status == "stop"){
                                        this.NewCorrida();
                                      }else if(resp.status == "Erro/indisponivel"){
                                              console.log("Erro/indisponivel");
                                              this.NewCorrida();
                                            }else{
                                              let alert1 = this.alertCtrl.create({
                                                title: 'Ocorreu um erro Inesperado.',
                                                subTitle:'Reinicie o aplicativo.',
                                                buttons: ["OK"]
                                              });
                                              alert1.present();
                                              console.log("resp.status: ",resp.status);
                                            }
                        
    });
  }
  ///////////FIM DO BEGINER///////////////////////

  openMenu() {
    if(this.authProvider.getPosition() != "off"){
      this.menuCtrl.open();
      }
    }

  ColorStatus(){
	const that = this;
		setTimeout (function () {
			if(that.authProvider.getstatus() == true){
				that.colorloc = 'secondary';
			}
			if(that.authProvider.getstatus() == false){
				that.colorloc = 'danger';
			}
	      that.ColorStatus();
       },2000);
  }
    
    ///////////iNICIO IONVIEWDIDENTER///////////////////////
    ionViewDidEnter() {
		 const that = this;
		   setTimeout (function () {
       that.GoogleMap();
       },2000);
    this.dadosprovider.getuser().then((user) =>{
    this.user = user;
    });
		//console.log("user ", this.user);
		//console.log("home.position ",this.Position);
		//função que dis oq fazer depois q a notificação e clicada
    let noti_update = this.localNotifications.on("click").subscribe(up =>{});
		/////////////////geolocalizacao////////////////
		
		this.geolocation.getCurrentPosition({ enableHighAccuracy: true }).then((resp) => {
			this.lat = resp.coords.latitude;
			this.lat = parseFloat(this.lat.toFixed(10));
			this.lon = resp.coords.longitude;
			this.lon = parseFloat(this.lon.toFixed(10));
			this.accuracy = resp.coords.accuracy;
			if(resp.coords.speed > 0){
				this.velocidade = this.velocidade * 3.6;
				this.velocidade = parseFloat(resp.coords.speed.toFixed(2));
			}
			this.mloc();
		  }).catch((error) => {
		  });
			let watch = this.geolocation.watchPosition({ enableHighAccuracy: true });
			watch.subscribe((data) => {
			this.lat = data.coords.latitude;
			this.lat = parseFloat(this.lat.toFixed(10));
			this.lon = data.coords.longitude;
			this.lon = parseFloat(this.lon.toFixed(10));
				if(data.coords.speed > 0){
					this.velocidade = this.velocidade * 3.6;
				  this.velocidade = parseFloat(data.coords.speed.toFixed(2));
				}
			   this.velo = data.coords.speed;
				if(this.authProvider.getstatus()  == true){
          this.dadosprovider.latlon(this.lat,this.lon).then(() =>{});
				}
			  let latLng = new google.maps.LatLng(this.lat,this.lon);
		    if(this.inicial == 1){
		      this.markers.setPosition(latLng);
			  }
        });
		/////////////////geolocalizacao////////////////
    }
	  /////////////////FIM DO ionViewDidEnter////////////////////////////
	
	cronometro(){
			const that = this;
			setTimeout (function () {
				if(that.corrida == true){
					that.cronos++;
					that.cronost = that.cronos.toString();
					if(that.cronos == 60){
						that.cronos = 0;
						that.cronost = that.cronos.toString();
						that.cronom++;
						that.cronomt = that.cronom.toString();}
					if(that.cronom == 60){
						that.cronom = 0;
						that.cronomt = that.cronom.toString();
						that.cronoh++;
						that.cronoht = that.cronoh.toString();}
					if(that.cronos < 10){
						that.cronost = "0" + that.cronos.toString();}
					if(that.cronoh < 10){
						that.cronoht = "0" + that.cronoh.toString();}
				that.cronometro();
			 }else{
          that.cronom = 0;
          that.cronoh = 0;	
          that.cronomt = "0";
          that.cronoht = "0";
          that.cronos = 0;	
          that.cronost = "0";
			 }
		   },1000);
		  }

    cronometro2(){
      const that = this;
      setTimeout (function () {
        if(that.userPass != "vazio" && that.ocupado == false){
          console.log("cronos rejeitou");
          that.disTime = "stop";//se for true o dissplay de solicitação esta visivel
          that.audio.stop('tabSwitch');
          setTimeout (function () {
            if( that.ocupado == false){
              that.disTime = false;//se for true o dissplay de solicitação esta visivel
              that.rejeitar();
            }
          },1000);
        }else{}
      },30000);
    }

    NewCorrida(){
      this.begin.NewCorrida().subscribe((info:any)=>{
        if(this.ocupado == false && info.info == "new" && this.userPass == "vazio"){
          this.userPass = info.userPass;
          console.log("userPass/NewCorrida: ", this.userPass);
          this.getInfo(info.userPass);
        }else{
          console.log("Erro/NewCorrida: ",info.info);
        }
      });
    }
      
    ///////////iNICIO DO GETINFO///////////////////////
    getInfo(userPass){
      console.log("getInfo");
      this.begin.getInfo(userPass).then((resp:any) =>{
          console.log("getinfo_resp: ",resp.status);
          if(this.disTime == false){
            if(resp.status == "OK"){
              this.backgroundMode.unlock();
              this.info = resp.result;
              this.getuser(resp.result);
              this.getUsuario(resp.result);
              this.cronometro2();
              this.disTime = true;  //se for true o dissplay de solicitação esta visivel
            }else{
              console.log("getInfo/Erro: ",resp.status);
              this.userPass = "vazio";
              this.authProvider.setUserp("vazio");
            }
          }else{
            console.log("getInfo/Erro (disTime true): ",resp.status);
          }
      });
    }
    ///////////FIM DO getInfo////////////////////////
  
    getuser(user){
      console.log("getuser");
      this.begin.getuser(user).subscribe((resp:any)=>{
        console.log("getuser_status, ",resp.status);
        if(this.userPass != "vazio" && resp.status == "off"){
          this.userPass = "vazio";
          this.passageiro = {};
          this.corrida = false; //so é true se a corrida já estiver iniciada
          this.ocupado = false;
          this.disTime = false;//se for true o dissplay de solicitação esta visivel
          this.authProvider.rejeitar(this.user).then(() =>{
            this.display = true;//controla o display dos botões no html
          });
          this.toast("viagem cancelada pelo passageiro");
          this.directionsDisplay.setMap(null);
          let myloc = {lat: this.lat,lng: this.lon};
          this.map.setCenter(myloc);
          this.info = {};
        }
      });
    }
    
    getUsuario(info){
      this.dadosprovider.getUsuario(info.user).on("value", userProfileSnapshot => {
        this.passageiro = userProfileSnapshot.val();
      });
    }
    
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
    aceito(info){
      this.audio.stop('tabSwitch');
		  this.disTime = false; //se for true o dissplay de solicitação esta visivel
      this.localNotifications.clear(1);
      this.vibration.vibrate(0);
      if(this.authProvider.getUserp() != "vazio"){
        this.insomnia.keepAwake().then(
          () => console.log('success/insomnia'),
          () => console.log('error/insomnia')
			  );
		    if(this.ocupado == false){
            this.dadosprovider.up(this.authProvider.getUserp()).then(newEvent => {
              this.authProvider.setAceito(true);//variavel compartilhada
              this.localNotifications.clear(1)
              this.toast("você aceitou a corrida va até o passageiro");
              this.ocupado = true;
              let latlon = new google.maps.LatLng(info.latd,info.lond);
              let way = new google.maps.LatLng(info.latp,info.lonp);
              this.directionsDisplay.setMap(this.map);
              this.calculateAndDisplayRoute(latlon,way);
              let dt = this.authProvider.getData();
              this.authProvider.descer(dt,this.user,this.userPass).then(()=>{
                this.authProvider.setposition(dt);
              });
            });
        }
	}
	}//FIM DE ACEITO()
    
    rejeitar(){
        this.localNotifications.clear(1);
        this.disTime = false; //se for true o dissplay de solicitação esta visivel
        if(this.authProvider.getUserp() != "vazio" && this.corrida != true){// this.corrida so é true se a corrida já estiver iniciada
            this.insomnia.allowSleepAgain().then(
                () => console.log('success/insomnia'),
                () => console.log('error/insomnia')
            );
            this.audio.stop('tabSwitch');
            this.vibration.vibrate(0);
            this.authProvider.rejeitados(this.userPass,this.user).then(() =>{
              this.dadosprovider.stopUser(this.info.user);
              this.dadosprovider.stopviagens(this.userPass);
              this.toast("viagem rejeitada");
              this.authProvider.rejeitarV().then(() =>{
                  this.authProvider.setUserp("vazio");//variavel  compartilhada
                  this.authProvider.rejeitar(this.user).then(() =>{
                      this.userPass = "vazio";
                      this.authProvider.setAceito(false);//variavel  compartilhada
                      this.directionsDisplay.setMap(null);
                      let myloc = {lat: this.lat,lng: this.lon};
                      this.map.setCenter(myloc);
                      this.ocupado = false;
                      this.passageiro= {};//zera os informações do passageiro
                      this.localNotifications.clear(1);
                      const that = this;
                      setTimeout (function () {//Possivel erro
                        if(that.authProvider.getPosition() != "off"){
                          that.authProvider.rejeitadosFim(that.user);}
                      },60000);});
              });
            });
        }
	}//FIM DE REJEITAR()

	cancelAlert(){
		let alert1 = this.alertCtrl.create({
			title: 'Você realmente deseja cancelar sua corrida?',
			subTitle:'O passageiro já está na sua espera.',
			buttons: [
			  { text: 'sim',
				  handler: () => {this.cancelar();}},
			  { text: 'não',
          handler: () => {}}]
		});
		alert1.present();
	}
    
  cancelar(){
		if(this.ocupado != false){
      this.ocupado = false;
      this.passageiro= {};//zera os informações do passageiro
      this.localNotifications.clear(1);
      this.display = true;//controla o display dos botões no html
      this.audio.stop('tabSwitch');
      this.vibration.vibrate(0);
		  if(this.authProvider.getstatus() == true){
	   	  this.dadosprovider.cancel(this.userPass).then(newEvent => {
          this.corrida = false; //this.corrida so é true se a corrida já estiver iniciada
          this.authProvider.rejeitados(this.userPass,this.user);
          const that = this;
          setTimeout (function () {
              if(that.authProvider.getPosition() != "off"){
                  that.authProvider.rejeitadosFim(that.user);
              }
          },5000);
          this.authProvider.stop(this.user);
          this.authProvider.rejeitar(this.user).then(() =>{
              this.authProvider.setUserp("vazio");//variavel compartilhada     
              this.authProvider.setAceito(false);//variavel compartilhada
          });
          this.toast("Você cancelou a viagem");
          this.directionsDisplay.setMap(null);
          let myloc = {lat: this.lat,lng: this.lon};
          this.map.setCenter(myloc);
          this.dadosprovider.stopUser(this.info.user);
          this.dadosprovider.stopviagens(this.userPass);
          this.info = {};
          this.userPass = "vazio";
       });	
		}
	  }
	}//FIM DE CANCELAR()

	golAlert(){
		if(this.ocupado == true){
      let alert1 = this.alertCtrl.create({
        title: 'Realmente deseja iniciara corrida?',
        subTitle:'a cronometragem da corrida ira iniciar.',
        buttons: [{ text: 'sim',
                    handler: () => {this.go();}
                  },{ text: 'não',
                      handler: () => {}
                  }]
          });
      alert1.present();
    }
	}
    
  go(){
		if(this.ocupado != false){
      this.authProvider.go(this.user).then( () =>{
        this.cronometro();
        this.toast("corrida iniciada");
        this.corrida = true;// this.corrida so é true se a corrida já estiver iniciada
      });
		}
	}

	endlAlert(){
		let alert1 = this.alertCtrl.create({
			title: 'Realmente deseja finalizar a corrida?',
			subTitle:'a cronometragem da corrida ira parar.',
      buttons: [{ text: 'sim', handler: () => {this.end();}},
                { text: 'não',handler: () => {}}]});
	  alert1.present();
	}
	
	end(){
		if(this.authProvider.getstatus() == true){//variavel compartilhada
			this.passageiro= {};
			this.insomnia.allowSleepAgain().then(
						() =>   console.log('success/insomnia'),
						() =>   console.log('error/insomnia'));
			this.dadosprovider.stopUser(this.info.user);
			this.dadosprovider.stopviagens(this.userPass);
		  this.dadosprovider.cancelEnd(this.userPass,this.info.id).then(newEvent => {
				this.dadosprovider.setHisto(this.info).then((histo:any)=>{
          this.pagamento.pagamento(this.info).then((pag:any)=>{
            this.corrida = false;// this.corrida so é true se a corrida já estiver iniciada
            this.authProvider.stop(this.user);
            this.authProvider.rejeitar(this.user).then(() =>{
              this.authProvider.setUserp("vazio");//variavel compartilhada
              this.authProvider.setAceito(false); //variavel compartilhada       
            });
            this.toast("Você finalizou a viagem");
            this.directionsDisplay.setMap(null);
            let myloc = {lat: this.lat,lng: this.lon};
            this.map.setCenter(myloc);
            this.ocupado = false;
            this.display = true;//controla o display dos botões no html   
            this.dadosprovider.stopUser(this.info.user);  
            this.dadosprovider.stopviagens(this.userPass);
            this.info = {}; 
            this.userPass = "vazio";
          });
        });
			});	
		}
		
		
		
	}//FIM DE end

    
  addMarker(lat: number, lng: number): void {
        let latLng = new google.maps.LatLng(lat, lng);
        let marker = new google.maps.Marker({ map: this.map,position: latLng,});
        this.markers = marker; 
        marker.setMap(this.map);
  }
	
	disp(){
		    if(this.display == true){
			      this.display = false;//controla o display dos botões no html
			  }else{
            if(this.display == false){
                this.display = true;//controla o display dos botões no html
            }
        }
	}

  mloc(){
        var myloc = {lat: this.lat,lng: this.lon};
        this.map.setCenter(myloc);
  }
     
  GoogleMap(){
    	let myloc = {lat: this.lat,lng: this.lon};	
    	this.map = new google.maps.Map(document.getElementById('map'), {
		      center: myloc,
          zoom: 17,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: false
		  });
		  let trafficLayer = new google.maps.TrafficLayer();
  		trafficLayer.setMap(this.map);
      this.inicial = 1;
      this.addMarker(this.lat,this.lon);
	}
	
	calculateAndDisplayRoute(latlong,way) {
		let latLng = new google.maps.LatLng(this.lat,this.lon);
    this.directionsService.route({
      	origin: latLng,
      	destination: latlong,
		    waypoints: [{location: way,stopover: true}],
      	travelMode: 'DRIVING'
    },(response, status) => {
        if(status === 'OK') {
        	let route = response.routes[0];
        	this.directionsDisplay.setDirections(response);
      	}else{
			      if(status == "ZERO_RESULTS"){
              this.directionsDisplay.setMap(null);
              let myloc = {lat: this.lat,lng: this.lon};
              this.map.setCenter(myloc);
              let alert1 =  this.alertCtrl.create({
                              title: 'Ocorreu um erro inesperado.',
                              subTitle:'desesja tentar novamente?',
                              buttons: [{ text: 'sim', handler: () => {
                                          this.directionsDisplay.setMap(this.map);
                                          this.calculateAndDisplayRoute(latlong,way);}},
                                        { text: 'não',handler: () => {}}
                                        ]
                            });
              alert1.present();
			      }else if(status == "UNKNOWN_ERROR"){
                this.toast('Lamentamos, mas houve um problema inesperado, por favor tente novamente');
                this.directionsDisplay.setMap(null);
                let myloc = {lat: this.lat,lng: this.lon};
                this.map.setCenter(myloc);
                let alert1 =  this.alertCtrl.create({
                                title: 'Ocorreu um erro inesperado.',
                                subTitle:'desesja tentar novamente?',
                                buttons: [{ text: 'sim', handler: () => {
                                            this.directionsDisplay.setMap(this.map);
                                            this.calculateAndDisplayRoute(latlong,way);}},
                                          {text: 'não', handler: () => {}}
                                          ]
                              });
                alert1.present();
			            }else{
                    this.toast('Lamentamos, mas houve um problema inesperado, por favor tente novamente');
                    this.directionsDisplay.setMap(null);
                    let myloc = {lat: this.lat,lng: this.lon};
                    this.map.setCenter(myloc);
                    let alert1 =  this.alertCtrl.create({
                                    title: 'Ocorreu um erro inesperado.',
                                    subTitle:'desesja tentar novamente?',
                                    buttons: [{ text: 'sim', handler: () => {
                                                this.directionsDisplay.setMap(this.map);
                                                this.calculateAndDisplayRoute(latlong,way);}},
                                              {text: 'não', handler: () => {}}
                                              ]
                                  });
                    alert1.present();
                  }
        }
    	});
	}
	
	toast(status) {
    let toast = this.toastCtrl.create({
                  message:status,
                  duration: 4000
                });
    toast.present();
  }
		
	/*matrix(){	
		this.service.getDistanceMatrix({
		origins: [latLng],
		destinations: [this.latlon],
		travelMode: 'DRIVING',
		unitSystem: google.maps.UnitSystem.METRIC,
		avoidHighways: false,
		avoidTolls: false
        },(response, status) => {	
  		if (status == 'OK')  {
	  		//this.presentToast();
    		var origins = response.originAddresses;
    		var destinations = response.destinationAddresses;
    		for (var i = 0; i <= origins.length; i++) {
      			var results = response.rows[i].elements;
      			for (var j = 0; j < results.length; j++) {
        		var element = results[j];
        		var distancev = element.distance.value;
        		var distancet = element.distance.text;
        		var duration = element.duration.text;
        		var from = origins[i];
        		var to = destinations[j];
				this.info.destino = to;
				this.info.origem = from;
				this.info.tempo = duration;
				this.info.distancet = distancet;
				this.info.valor = (distancev * 3)/1000;
				this.info.distancev = distancev;
		  		//console.log(this.info.origem);
		  		//this.presentToast2(duration);
		  		//this.presentToast2(distancet);
		  		//this.presentToast2(this.info.valor);
      			}
    		}
   			//this.presentToast();
  			}else{
	  		//this.presentToast2(status);
	    	}
		});
  }*/

			}
