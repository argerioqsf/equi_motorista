import { Injectable, ViewChild} from '@angular/core';
import { DadosProvider } from '../dados/dados';
import { AlertController } from 'ionic-angular';
/*
  Generated class for the PagamentoProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PagamentoProvider {
  constructor(private dadosProvider: DadosProvider,
              private alertCtrl: AlertController,) {
    console.log('Hello PagamentoProvider Provider');
  }

    pagamento(info){
      return new Promise((resolve,reject)=>{
          if(info.val == "Paypal"){
                let confirm = this.alertCtrl.create({
                title: 'O passageiro efetuará o pagamento via cartão pelo Paypal',
                message: 'Você pode verificar o status de pagamento pelo seu histórico de corridas.',
                buttons: [{text: 'OK', handler: () => {}}]
                });
                confirm.present();
                resolve({status:"OK",type:"paypal"});
          }else if(info.val == "Dinheiro"){
                  let confirm = this.alertCtrl.create({
                      title: 'O passageiro ja efetuou o pagamento?',
                      message: 'pagamento em dinheiro do valor de R$' + info.preco,
                      buttons: [{text: 'Sim', handler: () => {
                                this.dadosProvider.pago(info.user);
                                this.dadosProvider.pagoHisto(info.user,info.id);
                                }}]
                  });
                  confirm.present();
                  resolve({status:"OK",type:"dinheiro"});
                  }else{
                    let confirm = this.alertCtrl.create({
                        title: 'Ocorreu um erro no pagamento.',
                        message: 'Va na aba de pagamentos no menu lateral, para verificar o status de pagamento dessa viagem.',
                        buttons: ['OK']
                    });
                    resolve({status:"Erro"});
                    confirm.present();
                  }
        });

  }
  } 
