import { Component } from "@angular/core";
import {
Alert,
AlertController,
IonicPage,
NavController,
NavParams    
} from "ionic-angular";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthProvider } from "../../providers/auth/auth";
import { EmailValidator } from "../../validators/email";
import { BackgroundMode } from '@ionic-native/background-mode';
import { Platform, ViewController } from 'ionic-angular';
/**
 * Generated class for the ResetPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {
  public resetPasswordForm: FormGroup;
  constructor(public navCtrl: NavController,
public authProvider: AuthProvider,
public alertCtrl: AlertController,
formBuilder: FormBuilder, 
public navParams: NavParams,
public viewCtrl: ViewController,
public platform: Platform,
private backgroundMode: BackgroundMode) {

  this.platform.ready().then(() => {
    this.platform.registerBackButtonAction(() => {

      if(!this.viewCtrl.enableBack()) { 
        
        this.backgroundMode.moveToBackground();

       }else{

        this.navCtrl.pop();

       } 
      })});
      
      this.resetPasswordForm = formBuilder.group({
email: [
"",
Validators.compose([Validators.required, EmailValidator.isValid])
]
});
  }

  resetPassword(): void {
if (!this.resetPasswordForm.valid) {
console.log(
`Formulario invalido, corrija-o: ${this.resetPasswordForm.value}`
);
} else {
const email: string = this.resetPasswordForm.value.email;
this.authProvider.resetPassword(email).then(
user => {
const alert: Alert = this.alertCtrl.create({
message: "Enviamos um email de redefinição de senha para o email: "+email,
buttons: [
{
text: "Ok",
role: "Cancelar",
handler: () => {
this.navCtrl.pop();
}
}
]
});
alert.present();
},
error => {
const errorAlert = this.alertCtrl.create({
message: error.message,
buttons: [{ text: "Ok", role: "cancel" }]
});
errorAlert.present();
}
);
}
}
}
