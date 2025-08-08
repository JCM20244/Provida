const nodemailer =require('nodemailer');
const db = require('./db.config');
require('dotenv').config();

  // Mail transport configuration
let transporter = nodemailer.createTransport({
    host:'mail.provida.co.mz',
    port: 465,
    secure: true,
    auth: {
      user: 'laboratorio@provida.co.mz',
      pass: '@Provida2020', //imwq rigs zscp ldmm Pr0v1d@.123!?#
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  // Funcao de aviso de artigos que faltam 30 dias para expirar
  async function Aviso30dias(){
    db.query('SELECT * FROM lista_artigo_AVISO30_view',function(err,result){
        if(!err && result.length > 0){
            let message = (
                '<h4><b style="color:rgb(184, 187, 6);">AVISO Laboratorio</b>: Falta 30 dias para expiracao de artigos abaixo ! </h4>'+
                '<table style="border: 1px solid #444791;border-color: green; padding-left: 5px ; padding-right: 5">' +
                '<thead style="border: 1px; background-color: #444791;  ">' +
                '<th > Ref. </th>' +
                '<th> Lote </th>'  +
                '<th> Nome </th>'  +
                '<th> Expa.Data </th>'  +
                '</thead>'+
                '<tbody>'
            ); 
            result.map(item =>
                message += (
                '<tr>' +
                    '<td>'.concat(item.referencia)+ '</td>' +
                    '<td>'.concat(item.lote)+ '</td>' +
                    '<td>'.concat(item.descricao)+ '</td>' +
                    '<td>'.concat((new Date(item.expData)).toISOString().split('T')[0].replace(/-/g, '/')) + '</td>' +
                '</tr>'
                )
            );
            message +=  '</tbody> </table>'+'<h4>Nota: Recomendamos o uso destes artigos antes da data de expiracao! </h4>'+'<div>https://controlereagente-ce0ef6a6905c.herokuapp.com/</div>';
            let mailOptions = {
                from: 'laboratorio@provida.co.mz',  //it@provida.co.mz
                to: 'jcumbe.info@gmail.com',//'it@provida.co.mz, laboratorio@provida.co.mz, admin@provida.co.mz',
                subject: 'Software de Controle de Validade de Artigos do Laboratorio (HTRECS)',
                text: 'Email From HTRECS',
                html:message  
            };
            // Delivering mail with sendMail method
            transporter.sendMail(mailOptions, (error, info) => {
                if (!error){
                    console.log('O email foi enviado com sucesso!');
                }
            });
            //actualizar o estado do artigo e inserir na tabela ArtigosReported
            result.map(item=>{
                db.query('INSERT INTO ArtigoReported(artigo,lote,dataRep,numRep) VALUES (?,?,Now(),?)',[item.artigo, item.lote,item.dias], function(errs,resulti){
                    if(!err){
                        console.log('Artigo Reportado com sucesso!');
                    }
                });
                db.query('UPDATE Artigo SET reporteddias = 30 WHERE codigo = ?',[item.artigo],function(err,result){});
            });
        }
    });
  }
  // funcao de aviso de artigos que faltam 15 dias para expirar
  function Aviso15dias(){
    db.query('SELECT * FROM lista_artigo_AVISO15_view',function(err,result){
        if(!err && result.length > 0){
            let message = (
                '<h4><b style="color:rgb(184, 187, 6);">AVISO Laboratorio</b>: Falta 15 dias para expiracao de artigos abaixo ! </h4>'+
                '<table style="border: 1px solid #444791;border-color: green; padding-left: 5px ; padding-right: 5">' +
                '<thead style="border: 1px; background-color: #444791;  ">' +
                '<th > Ref. </th>' +
                '<th> Lote </th>'  +
                '<th> Nome </th>'  +
                '<th> Expa.Data </th>'  +
                '</thead>'+
                '<tbody>'
            ); 
            result.map(item =>
                message += (
                '<tr>' +
                    '<td>'.concat(item.referencia)+ '</td>' +
                    '<td>'.concat(item.lote)+ '</td>' +
                    '<td>'.concat(item.descricao)+ '</td>' +
                    '<td>'.concat((new Date(item.expData)).toISOString().split('T')[0].replace(/-/g, '/')) + '</td>' +
                '</tr>'
                )
            );
            message +=  '</tbody> </table>'+'<h4>Nota: Recomendamos o uso destes artigos antes da data de expiracao! </h4>'+'<div>https://controlereagente-ce0ef6a6905c.herokuapp.com/</div>';
            let mailOptions = {
                from: 'laboratorio@provida.co.mz',  //it@provida.co.mz
                to: 'jcumbe.info@gmail.com',//'it@provida.co.mz, laboratorio@provida.co.mz, admin@provida.co.mz',
                subject: 'Software de Controle de Validade de Artigos do Laboratorio (HTRECS)',
                text: 'Email From HTRECS',
                html:message  
            };
            // Delivering mail with sendMail method
            transporter.sendMail(mailOptions, (error, info) => {
                if (!error){
                    console.log('O email foi enviado com sucesso!');
                }
            });
            //actualizar o estado do artigo e inserir na tabela ArtigosReported
            result.map(item=>{
                db.query('INSERT INTO ArtigoReported(artigo,lote,dataRep,numRep) VALUES (?,?,Now(),?)',[item.artigo, item.lote,item.dias], function(errs,resulti){
                    if(!err){
                        console.log('Artigo Reportado com sucesso!');
                    }
                });
                db.query('UPDATE Artigo SET reporteddias = 15 WHERE codigo = ?',[item.artigo],function(err,result){});
            });
        }
    });
  }
  // funcao de aviso de artigos que faltam 7 dias para expirar
  function Aviso7dias(){
    db.query('SELECT * FROM lista_artigo_AVISO7_view',function(err,result){
        if(!err && result.length > 0){
            let message = (
                '<h4><b style="color:rgb(184, 187, 6);">AVISO Laboratorio</b>: Falta 7 dias para expiracao de artigos abaixo ! </h4>'+
                '<table style="border: 1px solid #444791;border-color: green; padding-left: 5px ; padding-right: 5">' +
                '<thead style="border: 1px; background-color: #444791;  ">' +
                '<th > Ref. </th>' +
                '<th> Lote </th>'  +
                '<th> Nome </th>'  +
                '<th> Expa.Data </th>'  +
                '</thead>'+
                '<tbody>'
            ); 
            result.map(item =>
                message += (
                '<tr>' +
                    '<td>'.concat(item.referencia)+ '</td>' +
                    '<td>'.concat(item.lote)+ '</td>' +
                    '<td>'.concat(item.descricao)+ '</td>' +
                    '<td>'.concat((new Date(item.expData)).toISOString().split('T')[0].replace(/-/g, '/')) + '</td>' +
                '</tr>'
                )
            );
            message +=  '</tbody> </table>'+'<h4>Nota: Recomendamos o uso destes artigos antes da data de expiracao! </h4>'+'<div>https://controlereagente-ce0ef6a6905c.herokuapp.com/</div>';
            let mailOptions = {
                from: 'laboratorio@provida.co.mz',  //it@provida.co.mz
                to: 'jcumbe.info@gmail.com',//'it@provida.co.mz, laboratorio@provida.co.mz, admin@provida.co.mz',
                subject: 'Software de Controle de Validade de Artigos do Laboratorio (HTRECS)',
                text: 'Email From HTRECS',
                html:message
            };
            // Delivering mail with sendMail method
            transporter.sendMail(mailOptions, (error, info) => {
                if (!error){
                    console.log('O email foi enviado com sucesso!');
                }
            });
            //actualizar o estado do artigo e inserir na tabela ArtigosReported
            result.map(item=>{
                db.query('INSERT INTO ArtigoReported(artigo,lote,dataRep,numRep) VALUES (?,?,Now(),?)',[item.artigo, item.lote,item.dias], function(error,resulti){
                    if(!error){
                        console.log('Artigo Reportado com sucesso!');
                    }
                });
                db.query('INSERT INTO ArtigoAgendado (artigo,lote,dataExp,dias,meses) VALUES (?,?,?,?,?)',[item.artigo,item.lote,item.expData,item.dias, item.mesdif], function(errs,results){
                    if(!err){
                        console.log('Artigo Agendado com sucesso!');
                    }
                });
                db.query('UPDATE Artigo SET reporteddias = 7 WHERE codigo = ?',[item.artigo],function(err,result){});
            });
        }
    });
  }
  // funcao de aviso de artigos expirados
  function AvisoExpirados(){
    db.query('SELECT * FROM lista_artigo_expirado_view',function(err,result){
        console.log(result);
        if(!err && result.length > 0){
            let message = (
                '<h4><b style="color:rgb(235, 27, 12);">AVISO Laboratorio</b>: Os seguintes artigos estao foram da validade! </h4>'+
                '<table style="border: 1px solid #444791;border-color: green; padding-left: 5px ; padding-right: 5">' +
                '<thead style="border: 1px; background-color: #444791;  ">' +
                '<th > Ref. </th>' +
                '<th> Lote </th>'  +
                '<th> Nome </th>'  +
                '<th> Expa.Data </th>'  +
                '</thead>'+
                '<tbody>'
            ); 
            result.map(item =>
                message += (
                '<tr>' +
                    '<td>'.concat(item.referencia)+ '</td>' +
                    '<td>'.concat(item.lote)+ '</td>' +
                    '<td>'.concat(item.descricao)+ '</td>' +
                    '<td>'.concat((new Date(item.expData)).toISOString().split('T')[0].replace(/-/g, '/')) + '</td>' +
                '</tr>'
                )
            );
            message +=  '</tbody> </table>'+'<h4>Nota: Recomendamos remover estes artigos! </h4>'+'<div>https://controlereagente-ce0ef6a6905c.herokuapp.com/</div>';
            let mailOptions = {
                from: 'laboratorio@provida.co.mz',  //it@provida.co.mz
                to: 'jcumbe.info@gmail.com', //'laboratorio@provida.co.mz, admin@provida.co.mz',
                subject: 'Software de Controle de Validade de Artigos do Laboratorio (HTRECS)',
                text: 'Email From HTRECS',
                html:message  
            };
            // Delivering mail with sendMail method
            transporter.sendMail(mailOptions, (error, info) => {
                if (!error){
                    console.log('O email foi enviado com sucesso!');
                }
            });
            //actualizar o estado do artigo e inserir na tabela ArtigosReported
            result.map(item=>{
                db.query('INSERT INTO ArtigoExpirado(artigo,dataExp) VALUES (?,Now())',[item.artigo], function(errs,resulti){
                    if(!errs){
                        console.log('Artigo Expirado inserido com sucesso!');
                    }
                });
                db.query('Update Artigo SET estado =?  where codigo=?',['AVISO',item.artigo],function(errs,results){
                    if(!errs){
                        console.log('Artigo actualizado com sucesso!');
                    }
                }); 
            });
        }
    });
  }
//funcao de notificacao
export default async function handdleCronJob() {
      //query para emitir uma mensagem de aviso de 30 dias
    Aviso30dias();
    //query para emitir uma mensagem de aviso de 15 dias
    Aviso15dias();   
    //query para emitir uma mensagem de aviso de 7 dias
    Aviso7dias(); 
    //query para emitir uma mensagem de aviso de artigo expirado
    AvisoExpirados();
        //fim
}
