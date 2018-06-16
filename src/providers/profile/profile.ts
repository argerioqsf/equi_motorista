import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import firebase from 'firebase';

/*
  Generated class for the ProfileProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ProfileProvider {
    
    public userProfile:firebase.database.Reference;
public currentUser:firebase.User;

  constructor() {
   firebase.auth().onAuthStateChanged( user => {
if(user){
this.currentUser = user;
this.userProfile = firebase.database().ref(`/DriverProfile/${user.uid}`);
}
});
  }
    
    getUserProfile(): firebase.database.Reference {
        console.log('profile ',this.userProfile);
        return this.userProfile;
    }
    
    updateName(firstName: string, lastName: string): Promise<any> {
return this.userProfile.update({ firstName, lastName });
}
    updateTel(telefone): Promise<any> {
    return this.userProfile.update({telefone:telefone});
}
    updatecod(codigo): Promise<any> {
    return this.userProfile.update({codigo:codigo});
}
    updatePlaca(placa): Promise<any> {
    return firebase.database().ref(`/DriverProfile/${this.currentUser.uid}/carro`).update({placa:placa});
}

updateModelo(modelo): Promise<any> {
    return firebase.database().ref(`/DriverProfile/${this.currentUser.uid}/carro`).update({modelo:modelo});
}
    
    updateDOB(birthDate:string):Promise<any> {
return this.userProfile.update({ birthDate });
}
    
    updateEmail(newEmail: string, password: string): Promise<any> {
const credential = firebase.auth.EmailAuthProvider.credential(
this.currentUser.email,
password
);
return this.currentUser
.reauthenticateWithCredential(credential)
.then(user => {
this.currentUser.updateEmail(newEmail).then(user => {
this.userProfile.update({ email: newEmail });
});
})
.catch(error => {
console.error(error);
});
}
    
    updatePassword(
newPassword: string,
oldPassword: string
): Promise<any> {
const credential = firebase.auth.EmailAuthProvider.credential(
this.currentUser.email,
oldPassword
);
return this.currentUser
.reauthenticateWithCredential(credential)
.then(user => {
this.currentUser.updatePassword(newPassword).then(user => {
console.log('Password Changed');
});
})
.catch(error => {
console.error(error);
});
}

}
