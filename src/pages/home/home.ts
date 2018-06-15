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
declare var google;


@Component({
  selector: 'page-home',
  templateUrl: 'home.html' 
})
export class HomePage {

disTime = false;
cronom = 0;
cronoh = 0;	
cronomt = "0";
cronoht = "0";
cronos = 0;	
cronost = "0";
 velocidade:number = 0;	
 colorloc = 'light';
 userpag;
 display = true;
 hfinal;
 valorf;
 hinicial;
 velo;
 velos:any = [];
 corrida = false;
 status;
 inicial = 0;
 map:any;
 lat:any = 0.0;
 lon:any = 0.0;
 accuracy:any;
 markers: any;
 refviagens:any;
 refviagens2:any;
 ocupado = false;
 not = false;
 cont = 0;
  user:any;
  confirm;
  usert  = "vazio";
  newuser;
  teste;
  pesq = 0;
  info:any = {};
  datanow;
  data;
  dia;
  mes;
  ano;
  horas;
  minutos;
  passageiro:any = {};
  driveron;
  driveron2;
  Position;
  userPass = "vazio";
  recebido = false;
  err = 0;
  bandeira;
  modo;
  pago;
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
        private begin: BeginProvider) {
      
	   console.log("................construtor......................");

	   this.platform.ready().then(() => {
		this.platform.registerBackButtonAction(() => {
	
		  if(!this.viewCtrl.enableBack()) { 
			
			this.backgroundMode.moveToBackground();
	
		   }else{
	
			this.navCtrl.pop();
	
		   } 
		  })});
	   
      this.ColorStatus();

      this.bandeira = this.afDB.object(`/bandeira`).valueChanges();

      this.bandeira.subscribe( result => { 
        console.log("bandeira ", result.modo);
        this.modo = result.modo;
      });
      
     this.beginer();
	    
  }

  beginer(){
    this.begin.begin().then((resp:any) =>{
      console.log("resp begin,  ", resp);
      if(resp == "Erro"){
        let alert1 = this.alertCtrl.create({
          title: 'Ocorreu um erro inesperado.',
          subTitle:'Deseja tentar Novamente?',
          buttons: [
            {
              text: 'sim',
              handler: () => {this.beginer();}
            },
            {
              text: 'não',
              handler: () => {}
            }
              ]
          });
          alert1.present();
      }else if(resp.status == "aceito"){
        this.recebido = true;
        this.not = true;
        this.userPass = resp.userPass;
        this.info = resp.info;
        this.ocupado = true;
        this.directionsDisplay.setMap(this.map);
        this.calculateAndDisplayRoute(resp.latlon,resp.way);  
        this.getuser(this.info);
        this.getUsuario();
      }else if(resp.status == "aceito"){
        this.toast("Corrida já iniciada. ");
        this.recebido = true;
        this.not = true;
        this.userPass = resp.userPass;
        this.info = resp.info;
        this.ocupado = true;
        this.corrida = true;
        this.directionsDisplay.setMap(this.map);
        this.calculateAndDisplayRoute(resp.latlon,resp.way);
        this.getuser(this.info);
        this.getUsuario();
      }else if(resp.status == "stop"){
        this.cronos = 60;
        this.disTime = true;
        this.cronometro2();
      } 
    });
  }
    
//FIM DO CONSTRUTOR

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
    
    ionViewDidEnter() {
        
		 const that = this;
		
		   setTimeout (function () {
       that.GoogleMap();
       },2000);
		//this.toast("entrou");
		
		this.user = this.dadosprovider.getuser();
        
		console.log("user ", this.user);
        
		this.refviagens = this.afDB.list('/viagens').valueChanges();
		
		console.log("home.position ",this.Position);
        
		this.driveron = this.afDB.list(`/DriverProfile`).valueChanges();
		/*
		this.driveron.subscribe( result => {
			
			
			
			this.status = this.authProvider.getstatus();
			
			if(this.status == false && this.ocupado != true){
				
				this.userPass = "vazio";
				
			}
            
			//this.authProvider.contOff(result.length - 1);
            
			if(this.authProvider.getstatus()  == true){
                
				console.log("result driveron ",result);
				
	
				this.Position = this.authProvider.getPosition();
	
				for(var i = 0; i < result.length; i++ ){

					if(result[i].status != true && result[i].status != false){
						
					//console.log("position  ",this.Position);
					//console.log("user  ",this.user);
					
					if(result[i].id == this.user  && this.recebido == false && this.authProvider.getAceito() == false){
					    
						console.log("result[i].id ",result[i].id);
						console.log("user ",this.user);
						console.log("resulti user ",result[i].id);
						
						//if(result[i].user != this.user ){
							
						//this.authProvider.driveron(this.Position,this.user).then(() =>{
				    	this.authProvider.seCont();
				    	//});
							
						//}
                        
						if(result[i].status == "off"){
							//this.authProvider.setstatus(false);
						}
                        
						console.log("userPass antes ",result[i].viagens);
                        
						this.userPass = "vazio";
                        
						if(result[i].viagens != "vazio" && result[i].status != "off"){
							
						    if(result[i].status.status != "go" && result[i].status.status != "aceito"){
								
								console.log("userPass ",result[i].viagens);
								this.userPass = result[i].viagens;
								this.authProvider.setUserp(this.userPass);
								//this.toast("setuserp 2"+this.userPass);
								this.getInfo();
								
							}
					}
                        
                        
					}
				}}
			}
		});*/
        
			//função que dis oq fazer depois q a notificação e clicada
        	let noti_update = this.localNotifications.on("click").subscribe(up =>{

          });
        	
        
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
			console.log('localização atual', this.lat,this.lon);
			//alert(this.lat,this.lon);
			console.log('accuracy atual', this.accuracy);
			this.mloc();
		}).catch((error) => {
		  	console.log('Error getting location', error);
		});
			let watch = this.geolocation.watchPosition({ enableHighAccuracy: true });
			watch.subscribe((data) => {
			//this.accuracy = data.coords.accuracy;
			this.lat = data.coords.latitude;
			this.lat = parseFloat(this.lat.toFixed(10));
			this.lon = data.coords.longitude;
			this.lon = parseFloat(this.lon.toFixed(10));


				if(data.coords.speed > 0){
					this.velocidade = this.velocidade * 3.6;
				this.velocidade = parseFloat(data.coords.speed.toFixed(2));
				}
	
				 console.log("velocidade soma, ",this.velo);
			this.velo = data.coords.speed;

				if(this.authProvider.getstatus()  == true){
					
			
					console.log("salvando lat lon",this.lat,this.lon);
					
			this.dadosprovider.latlon(this.lat,this.lon).then(() =>{
				
			});
				}
				//this.dadosprovider.dados(this.lat,this.lon).then(newEvent => {
				
			//});
				
			let latLng = new google.maps.LatLng(this.lat,this.lon);
		   if(this.inicial == 1){
		    this.markers.setPosition(latLng);
			}
			console.log('localização atual', this.lat,this.lon);
			//alert(this.lat,this.lon);
			console.log('accuracy atual', this.accuracy);
			});

		/////////////////geolocalizacao////////////////


    }
	//FIM DO ionViewDidEnter
	
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
						that.cronomt = that.cronom.toString();
					}

					if(that.cronom == 60){
						that.cronom = 0;
						that.cronomt = that.cronom.toString();
						that.cronoh++;
						that.cronoht = that.cronoh.toString();
					}
					if(that.cronos < 10){

						that.cronost = "0" + that.cronos.toString();
					}
					if(that.cronoh < 10){

						that.cronoht = "0" + that.cronoh.toString();
					}

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

				if(that.userPass != "vazio" && that.not == false){

					that.cronos--;
					console.log("cronos : ", that.cronos);
					that.cronost = that.cronos.toString();

					if(that.cronos == 0){
						that.cronos = 0;
						that.disTime = false;
						that.audio.stop('tabSwitch');
						
					}

					if(that.cronos == -7){
						that.cronos = 0;
						that.rejeitar();
					}else{
						that.cronometro2();
					}

				

			}else{

			 	that.cronos = 0;
			}

		   },1000);

		  }
	

    
    	getInfo(){
		 /*
			this.refviagens.subscribe(result => {
			
			if(this.authProvider.getstatus()  == true){
				
				console.log("atualização");
                
					for(var i = 0; i < result.length; i++ ){
						
						if(result[i].user == this.userPass && this.userPass != "vazio"){
							
							console.log("status viagem ",result[i].status);
							
						   if(this.recebido == false){

							this.navCtrl.popAll();
							//this.authProvider.setAceito(true);
							this.authProvider.Ocupado(true);
							this.cronos = 60;
							this.disTime = true;
							this.cronometro2();

							 this.localNotifications.schedule({
							id: 1,
							text: 'solicitação de viagem para:' + result[i].destino,
							icon:'../assets/images/icon4.png',
							color: 'FFFF00'
							});
								
							this.backgroundMode.unlock();
						
							//this.backgroundMode.moveToForeground();	

						    this.audio.play('tabSwitch');	

							this.vibration.vibrate([5000,5000,5000]);
							
		    				console.log("viagem nova ");
                               
							this.info = result[i];
                               
							this.recebido = true;
                               
							this.getuser(this.info);
                               
							this.getUsuario();
							this.cronometro2();
							   
						    }
							
						   }
						
						}//FIM DO FOR
                       
	    				}
            });*/
		
	}//FIM DO getInfo
    
    getuser(user){
        
		this.dadosprovider.getviagens(user.user).on("value", userProfileSnapshot => {
            
			console.log('user ', userProfileSnapshot.val());
			//console.log('user status ', userProfileSnapshot.val().status);
			console.log("usert, usermy ",this.usert,", ", this.user);
			
			if(userProfileSnapshot.val().status == "off"){

				this.authProvider.setUserp("vazio");

				if(this.recebido == true){

					this.passageiro= {};

					this.recebido = false;

					this.corrida = false;
					
					this.audio.stop('tabSwitch');

					this.insomnia.allowSleepAgain()
					.then(
						() => console.log('success'),
						() => console.log('error')
					);

					this.authProvider.setUserp("vazio");
					this.localNotifications.clear(1);
					this.vibration.vibrate(0);
					
					this.ocupado = false;
					this.localNotifications.schedule({
						id: 1,
						text: 'O usuario cancelou a viagem',
						icon:'../assets/images/icon4.png',
						color: 'FFFF00'
					});
					this.authProvider.stop(this.user);
					this.authProvider.Ocupado(false);
					this.authProvider.rejeitar(this.user).then(() =>{
					this.recebido = false;
					this.display = true;
					this.authProvider.setAceito(false);
					});
					
					this.pesq = 0;
					console.log("cancelou");
					this.toast("viagem cancelada pelo passageiro");
					this.directionsDisplay.setMap(null);
					console.log("cancelou2");
					let myloc = {lat: this.lat,lng: this.lon};
        			this.map.setCenter(myloc);
					console.log("cancelou3");
					
					this.not = false;
					this.usert = "vazio";
					//this.livre();
				    console.log("cancelou4");
					this.dadosprovider.stopUser(this.info.user);
					this.dadosprovider.stopviagens(this.userPass);
					this.info = {};
					this.userPass = "vazio";
				}}
			
			  
			 
		     
			
		});

	}
    
    getUsuario(){
        
		console.log("info.user ",this.info.user);
		this.dadosprovider.getUsuario(this.info.user).on("value", userProfileSnapshot => {
			console.log("userprofile ",userProfileSnapshot.val());
			this.passageiro = userProfileSnapshot.val();
			
		});
		
	}
    
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
    aceito(info){

		this.not = true;

		this.disTime = false;

		this.localNotifications.clear(1);

		if(this.authProvider.getUserp() != "vazio"){

			this.insomnia.keepAwake()
			.then(
				() => console.log('success'),
				() => console.log('error')
			);	
        //PARA O TOQUE DE ALERTA
		this.audio.stop('tabSwitch');
		this.vibration.vibrate(0);
		console.log("this.ocupado2 ",this.ocupado);
		
		if(this.ocupado == false){
			
		this.dadosprovider.up(this.authProvider.getUserp()).then(newEvent => {
			
		this.authProvider.setAceito(true);
		
		this.pesq = 1;
            
		this.localNotifications.clear(1);
            
		console.log('aceito');
				
        this.toast("você aceitou a corrida va até o passageiro");
    	
		this.getuser(this.info);
            
		this.ocupado = true;
			
		let latlon = new google.maps.LatLng(this.info.latd,this.info.lond);
            
		let way = new google.maps.LatLng(this.info.latp,this.info.lonp);
            
		console.log('way ' + way + 'latlon ' + latlon);
            
		this.directionsDisplay.setMap(this.map);
            
		this.calculateAndDisplayRoute(latlon,way);
			
			//this.authProvider.setstatus(false);
			
			 //const that = this;
			
			//setTimeout (function () {
				
			//that.authProvider.setstatus(false);
				
			 //that.authProvider.Off().then(()=>{
				 
				 let dt = this.authProvider.getData();
				 this.authProvider.descer(dt,this.user,this.userPass).then(()=>{
					 
					 //that.authProvider.setstatus(true);
				 });
				 
			// });
				
			//},2000);
				
			});
		}
	}
	}//FIM DE ACEITO()
    
     rejeitar(){

		 this.localNotifications.clear(1);

		 this.passageiro= {};

		 this.disTime = false;

         if(this.authProvider.getUserp() != "vazio" && this.corrida != true){

			this.insomnia.allowSleepAgain()
					.then(
						() => console.log('success'),
						() => console.log('error')
					);

		     console.log('stop audio');
         
			 this.audio.stop('tabSwitch');
			 this.vibration.vibrate(0);
		     //this.audio.stop('tabSwitch');
		
		     this.authProvider.rejeitados(this.userPass,this.user).then(() =>{
				 
			 this.dadosprovider.stopUser(this.info.user);

			 this.authProvider.Ocupado(false);
                 
			 this.dadosprovider.stopviagens(this.userPass);
                 
		     this.toast("viagem rejeitada");
                 
		     this.authProvider.rejeitarV().then(() =>{
				
				this.authProvider.setUserp("vazio");
				
				this.authProvider.rejeitar(this.user).then(() =>{
					
					this.recebido = false;
                    
					this.userPass = "vazio";
                    
					 this.authProvider.setAceito(false);
                    
					 this.directionsDisplay.setMap(null);
                    
					 let myloc = {lat: this.lat,lng: this.lon};
                    
					 this.map.setCenter(myloc);
                    
					 this.dadosprovider.stopviagens(this.userPass);
                    
					 this.dadosprovider.stopUser(this.info.user);
                    
					 this.ocupado = false;
                    
					 this.localNotifications.clear(1);
                    
					 console.log('rejeito');
                    
					 this.newuser = null;
                    
					 const that = this;
                    

					 setTimeout (function () {
                         
						 if(that.authProvider.getPosition() != "off"){

							that.authProvider.rejeitadosFim(that.user);}

					 },60000);
					
					
			});
					
			});
		   
		    });
		}
	}//FIM DE REJEITAR()

	cancelAlert(){

		let alert1 = this.alertCtrl.create({
			title: 'Você realmente deseja cancelar sua corrida?',
			subTitle:'O passageiro já está na sua espera.',
			buttons: [
			  {
				  text: 'sim',
				  handler: () => {
	
					this.cancelar();
				  }
			  },
			  {
				  text: 'não',
				  handler: () => {
					
				  }
			  }
				  ]
		  });
		  alert1.present();

	}
    
    cancelar(){

		if(this.recebido != false){

		this.passageiro= {};
		this.ocupado = false;
		this.localNotifications.clear(1);
        this.display = true;
		this.audio.stop('tabSwitch');
		this.vibration.vibrate(0);
        
		if(this.authProvider.getstatus() == true){
		
		this.dadosprovider.cancel(this.userPass).then(newEvent => {
				
			this.authProvider.Ocupado(false);	
			
			    this.corrida = false;
            
       			this.toast("viagem cancelada");
				
    		
		            this.authProvider.rejeitados(this.userPass,this.user);
					
					const that = this;
			
					 setTimeout (function () {
                         
						 if(that.authProvider.getPosition() != "off"){
							that.authProvider.rejeitadosFim(that.user);}
				 
			 		 },5000);
					
					this.authProvider.setAceito(false);
            
					this.authProvider.stop(this.user);
            
					this.authProvider.rejeitar(this.user).then(() =>{
                        
					this.recebido = false;
                        
					this.authProvider.setUserp("vazio");
                        
					this.authProvider.setAceito(false);
                        
					});
		
		   			
            
					this.pesq = 0;
            
					console.log("cancelou");
            
					this.toast("Você cancelou a viagem");
            
					this.directionsDisplay.setMap(null);
            
					console.log("cancelou2");
            
					let myloc = {lat: this.lat,lng: this.lon};
            
        			this.map.setCenter(myloc);
            
					console.log("cancelou3");
					
					this.not = false;
            
					this.usert = "vazio";
            
					//this.livre();
				    console.log("cancelou4");
            
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
			buttons: [
			  {
				  text: 'sim',
				  handler: () => {
	
					this.go();
				  }
			  },
			  {
				  text: 'não',
				  handler: () => {
					
				  }
			  }
				  ]
		  });
		  alert1.present();
		}

	}
    
    
    go(){
		
		if(this.recebido != false){

		this.authProvider.go(this.user).then( () =>{
            
			this.hinicial = new Date().getHours();

			this.cronometro();
			
			this.toast("corrida iniciada");
			this.corrida = true;
			//this.valor();
		 });
		}
	}

	endlAlert(){

		let alert1 = this.alertCtrl.create({
			title: 'Realmente deseja finalizar a corrida?',
			subTitle:'a cronometragem da corrida ira parar.',
			buttons: [
			  {
				  text: 'sim',
				  handler: () => {
	
					this.end();
				  }
			  },
			  {
				  text: 'não',
				  handler: () => {
					
				  }
			  }
				  ]
		  });
		  alert1.present();

	}
	
	end(){
		
		if(this.authProvider.getstatus() == true){

			this.passageiro= {};

			this.insomnia.allowSleepAgain()
					.then(
						() => console.log('success'),
						() => console.log('error')
					);
			
			this.dadosprovider.stopUser(this.info.user);

			this.authProvider.Ocupado(false);
            
			this.dadosprovider.stopviagens(this.userPass);
			
		    this.dadosprovider.cancelEnd(this.userPass,this.info.id).then(newEvent => {

				this.userpag = this.userPass;

				let id2 = this.info.id;

				this.dadosprovider.getHisto(this.userpag,id2).once("value", userProfileSnapshot => {

					let result = userProfileSnapshot.val();
					this.dadosprovider.setHisto(result)
					console.log("result",result); 


				});

				
					if(this.info.val == "Paypal"){
                         //eu criei outra variavel pra armazenar o usserpass porque vou zerar o a variavel usserpass  depois dessa operação
						 this.userpag = this.userPass;
				         this.pago = this.afDB.list(`/viagens/${this.userpag}`).valueChanges();
						
							this.pago.subscribe( result => {
                                //this.toast("resulte pag," + result[4]);
								if( result[5] == "pago"){
									
									this.localNotifications.schedule({
										id: 1,
										text: 'Pagamento efetuado',
										icon:'../assets/images/icon4.png',
										color: 'FFFF00'
									});
									
									 let confirm = this.alertCtrl.create({
										  title: 'O passageiro já efetou o pagamento',
										  message: 'pagamento via Paypal',
										  buttons: ['OK']
							});
							confirm.present();
									
									this.pago.unsubscribe();
								}
							});
					 }//FIM DO IF "paypal"
					 let id = this.info.id;
			         if(this.info.val == "Dinheiro"){
                         
						 this.userpag = this.userPass;
						 
                         
						 let confirm = this.alertCtrl.create({
                             
						  title: 'O passageiro ja efetuou o pagamento?',
						  message: 'pagamento em dinheiro',
						  buttons: [{
								  text: 'Sim',
								  handler: () => {
									  this.dadosprovider.pago(this.userpag);
									  this.dadosprovider.pagoHisto(this.userpag,id);
									  this.userpag = "vazio";
        						}}]
					      });
    				      confirm.present();
						 
					 }
			
			        this.corrida = false;
       			    //this.toast("viagem fiinalizada");
				
					this.authProvider.setAceito(false);
                
					this.authProvider.stop(this.user);
                
					this.authProvider.rejeitar(this.user).then(() =>{
                        
					this.recebido = false;
					
					this.authProvider.setUserp("vazio");
                        
					this.authProvider.setAceito(false);
                        
					});
                
					this.pesq = 0;
                
					console.log("finalizou");
                
					this.toast("Você finalizou a viagem");
                
					this.directionsDisplay.setMap(null);
                
					console.log("finalizou2");
                
					let myloc = {lat: this.lat,lng: this.lon};
                
        			this.map.setCenter(myloc);
                
					this.not = false;

					this.ocupado = false;

					this.display = true;
                
					this.usert = "vazio";
                
					this.dadosprovider.stopUser(this.info.user);
                
					this.dadosprovider.stopviagens(this.userPass);

					this.info = {}; 

					this.userPass = "vazio";
            });	
		}
		
		
		
	}//FIM DE end
	
	valor(){
		
		  console.log("velocidade soma, ",this.velo);
		 const that = this;
		if(this.corrida == true){
			
		setTimeout (function () {
			
            
			that.velos.push(that.velo);
			
			that.valor();
       },60000);
		
		}
		
	}
    
    addMarker(lat: number, lng: number): void {
        
		console.log('localização atual');
        
    	let latLng = new google.maps.LatLng(lat, lng);
        
    	let marker = new google.maps.Marker({ map: this.map,
      										  position: latLng,});
        
    	this.markers = marker; 
        
     	marker.setMap(this.map);
    }
	
	disp(){
		
		console.log("display, ",this.display);
		
		if(this.display == true){
			
			this.display = false;
			
		}else{
		
		if(this.display == false){
			
			this.display = true;
			
		}}
		
		console.log("display 2, ",this.display);
	}
	
    mloc(){
        //this.showConfirm();
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

		if(this.pesq == 1){
		   this.directionsDisplay.setMap(this.map);}
		
		 this.inicial = 1;
         //this.mloc();
         this.addMarker(this.lat,this.lon);
         //this.map.setCenter(myloc);
	}
	
	private dataHoje() {
     		this.data = new Date();
     		this.dia = this.data.getDate();
     		this.mes = this.data.getMonth() + 1;
		    let dia2 = this.dia;
		    if (dia2 < 10) {
        		dia2 = "0" + dia2;
    		}
		    let me = this.mes;
     		if (me < 10) {
        		me = "0" + me;
    		}
    		this.ano = this.data.getFullYear();
    		this.horas = new Date().getHours();
		    let hor = this.horas;
    		if (hor < 10) {
        		hor = "0" + hor;
    		}
    		this.minutos = new Date().getMinutes();
		    let min = this.minutos;
    		if (min < 10) {
        		min = "0" + min;
    		}
    		this.datanow = dia2+"/"+me+"/"+this.ano+", "+ hor + "h " + min;                 
    		
	   	}
	
	calculateAndDisplayRoute(latlong,way) {
		//this.confirm = 1;
		console.log("entrou geo");
		let latLng = new google.maps.LatLng(this.lat,this.lon);
    	this.directionsService.route({
      	origin: latLng,
      	destination: latlong,
		waypoints: [{
              location: way,
              stopover: true
            }],
      	travelMode: 'DRIVING'
    	}, (response, status) => {
      	if (status === 'OK') {

			let route = response.routes[0];
        	this.directionsDisplay.setDirections(response);
		    for (var i = 0; i < route.legs.length; i++) {
				//let routeSegment = i + 1;
				//alert('waypoint nº: ' + routeSegment + ', começo: ' +  route.legs[i].start_address + ', fim: ' + route.legs[i].end_address + ', distancia: ' + route.legs[i].distance.text);
			}	
		    	
      	} else {
			if(status == "ZERO_RESULTS"){
				//this.toast('somente endereços dentro do amapa serão validos, tente novamente ');
				this.directionsDisplay.setMap(null);
				let myloc = {lat: this.lat,lng: this.lon};
				this.map.setCenter(myloc);

				let alert1 = this.alertCtrl.create({
					title: 'Ocorreu um erro inesperado.',
					subTitle:'desesja tentar novamente?',
					buttons: [
					  {
						  text: 'sim',
						  handler: () => {
							this.directionsDisplay.setMap(this.map);
							this.calculateAndDisplayRoute(latlong,way);
						  }
					  },
					  {
						  text: 'não',
						  handler: () => {
							
						  }
					  }
						  ]
				  });
				  alert1.present();
			}
			if(status == "UNKNOWN_ERROR"){
				this.toast('Lamentamos, mas houve um problema inesperado, por favor tente novamente');
				this.directionsDisplay.setMap(null);
				let myloc = {lat: this.lat,lng: this.lon};
				this.map.setCenter(myloc);

				let alert1 = this.alertCtrl.create({
					title: 'Ocorreu um erro inesperado.',
					subTitle:'desesja tentar novamente?',
					buttons: [
					  {
						  text: 'sim',
						  handler: () => {
							this.directionsDisplay.setMap(this.map);
							this.calculateAndDisplayRoute(latlong,way);
						  }
					  },
					  {
						  text: 'não',
						  handler: () => {
							
						  }
					  }
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
		  		console.log(this.info.origem);
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
