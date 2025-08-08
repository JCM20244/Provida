// backend/api/cron-job.js

// Ensure these imports match your actual db.config.js export if it's not a default export
// If db.config.js uses module.exports = db;, you might need: const db = require('../db.config');
import nodemailer from 'nodemailer';
import db from '../db.config'; // Assuming db.config.js exports the db connection directly or via module.exports

require('dotenv').config(); // Load environment variables from .env file (for local development)

// Mail transport configuration - make sure these use environment variables for production on Vercel
let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // Use env var or default
    port: process.env.EMAIL_PORT, // Use env var or default
    secure: true,
    auth: {
      user: process.env.EMAIL_HOST_USER,
      pass: process.env.EMAIL_HOST_PASSWORD, //imwq rigs zscp ldmm Pr0v1d@.123!?#
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

// Funcao de aviso de artigos que faltam 30 dias para expirar
async function Aviso30dias(){
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM lista_artigo_AVISO30_view', function(err, result){
            if(err){
                console.error('Error in Aviso30dias query:', err);
                return reject(err);
            }
            if(result.length > 0){
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
                    from: 'laboratorio@provida.co.mz', // Use env var
                    to: 'jcumbe.info@gmail.com', // Use env var
                    subject: 'Software de Controle de Validade de Artigos do Laboratorio (HTECS)',
                    text: 'Email From HTECS',
                    html:message
                };
                // Delivering mail with sendMail method
                transporter.sendMail(mailOptions, (error, info) => {
                    if (!error){
                        console.log('Aviso30dias: O email foi enviado com sucesso!');
                        resolve(); // Resolve on success
                    } else {
                        console.error('Aviso30dias: Error sending email:', error);
                        reject(error); // Reject on error
                    }
                });
                //actualizar o estado do artigo e inserir na tabela ArtigosReported
                result.map(item=>{
                    db.query('INSERT INTO ArtigoReported(artigo,lote,dataRep,numRep) VALUES (?,?,Now(),?)',[item.artigo, item.lote,item.dias], function(errs,resulti){
                        if(!errs){
                            console.log('Aviso30dias: Artigo Reportado com sucesso!');
                        } else {
                            console.error('Aviso30dias: Error inserting into ArtigoReported:', errs);
                        }
                    });
                    db.query('UPDATE Artigo SET reporteddias = 30 WHERE codigo = ?',[item.artigo],function(errs,results){
                        if(!errs){
                            console.log('Aviso30dias: Artigo actualizado com sucesso!');
                        } else {
                            console.error('Aviso30dias: Error updating Artigo:', errs);
                        }
                    });
                });
            } else {
                console.log('Aviso30dias: No articles found for 30-day warning.');
                resolve(); // Resolve even if no articles
            }
        });
    });
}

// funcao de aviso de artigos que faltam 15 dias para expirar
async function Aviso15dias(){
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM lista_artigo_AVISO15_view', function(err, result){
            if(err){
                console.error('Error in Aviso15dias query:', err);
                return reject(err);
            }
            if(result.length > 0){
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
                    from: 'laboratorio@provida.co.mz',
                    to: 'jcumbe.info@gmail.com',
                    subject: 'Software de Controle de Validade de Artigos do Laboratorio (HTECS)',
                    text: 'Email From HTECS',
                    html:message
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (!error){
                        console.log('Aviso15dias: O email foi enviado com sucesso!');
                        resolve();
                    } else {
                        console.error('Aviso15dias: Error sending email:', error);
                        reject(error);
                    }
                });
                result.map(item=>{
                    db.query('INSERT INTO ArtigoReported(artigo,lote,dataRep,numRep) VALUES (?,?,Now(),?)',[item.artigo, item.lote,item.dias], function(errs,resulti){
                        if(!errs){
                            console.log('Aviso15dias: Artigo Reportado com sucesso!');
                        } else {
                            console.error('Aviso15dias: Error inserting into ArtigoReported:', errs);
                        }
                    });
                    db.query('UPDATE Artigo SET reporteddias = 15 WHERE codigo = ?',[item.artigo],function(errs,results){
                        if(!errs){
                            console.log('Aviso15dias: Artigo actualizado com sucesso!');
                        } else {
                            console.error('Aviso15dias: Error updating Artigo:', errs);
                        }
                    });
                });
            } else {
                console.log('Aviso15dias: No articles found for 15-day warning.');
                resolve();
            }
        });
    });
}

// funcao de aviso de artigos que faltam 7 dias para expirar
async function Aviso7dias(){
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM lista_artigo_AVISO7_view', function(err, result){
            if(err){
                console.error('Error in Aviso7dias query:', err);
                return reject(err);
            }
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
                    from: 'laboratorio@provida.co.mz',
                    to: 'jcumbe.info@gmail.com',
                    subject: 'Software de Controle de Validade de Artigos do Laboratorio (HTECS)',
                    text: 'Email From HTECS',
                    html:message
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (!error){
                        console.log('Aviso7dias: O email foi enviado com sucesso!');
                        resolve();
                    } else {
                        console.error('Aviso7dias: Error sending email:', error);
                        reject(error);
                    }
                });
                result.map(item=>{
                    db.query('INSERT INTO ArtigoReported(artigo,lote,dataRep,numRep) VALUES (?,?,Now(),?)',[item.artigo, item.lote,item.dias], function(error,resulti){
                        if(!error){
                            console.log('Aviso7dias: Artigo Reportado com sucesso!');
                        } else {
                            console.error('Aviso7dias: Error inserting into ArtigoReported:', error);
                        }
                    });
                    db.query('INSERT INTO ArtigoAgendado (artigo,lote,dataExp,dias,meses) VALUES (?,?,?,?,?)',[item.artigo,item.lote,item.expData,item.dias, item.mesdif], function(errs,results){
                        if(!errs){
                            console.log('Aviso7dias: Artigo Agendado com sucesso!');
                        } else {
                            console.error('Aviso7dias: Error inserting into ArtigoAgendado:', errs);
                        }
                    });
                    db.query('UPDATE Artigo SET reporteddias = 7 WHERE codigo = ?',[item.artigo],function(errs,results){
                        if(!errs){
                            console.log('Aviso7dias: Artigo actualizado com sucesso!');
                        } else {
                            console.error('Aviso7dias: Error updating Artigo:', errs);
                        }
                    });
                });
            } else {
                console.log('Aviso7dias: No articles found for 7-day warning.');
                resolve();
            }
        });
    });
}

// funcao de aviso de artigos expirados
async function AvisoExpirados(){
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM lista_artigo_expirado_view', function(err, result){
            if(err){
                console.error('Error in AvisoExpirados query:', err);
                return reject(err);
            }
            console.log('AvisoExpirados result:', result); // For debugging
            if(result.length > 0){
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
                    from: 'laboratorio@provida.co.mz',
                    to: 'jcumbe.info@gmail.com',
                    subject: 'Software de Controle de Validade de Artigos do Laboratorio (HTECS)',
                    text: 'Email From HTECS',
                    html:message
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (!error){
                        console.log('AvisoExpirados: O email foi enviado com sucesso!');
                        resolve();
                    } else {
                        console.error('AvisoExpirados: Error sending email:', error);
                        reject(error);
                    }
                });
                result.map(item=>{
                    db.query('INSERT INTO ArtigoExpirado(artigo,dataExp) VALUES (?,Now())',[item.artigo], function(errs,resulti){
                        if(!errs){
                            console.log('AvisoExpirados: Artigo Expirado inserido com sucesso!');
                        } else {
                            console.error('AvisoExpirados: Error inserting into ArtigoExpirado:', errs);
                        }
                    });
                    db.query('Update Artigo SET estado =?  where codigo=?',['AVISO',item.artigo],function(errs,results){
                        if(!errs){
                            console.log('AvisoExpirados: Artigo actualizado com sucesso!');
                        } else {
                            console.error('AvisoExpirados: Error updating Artigo estado:', errs);
                        }
                    });
                });
            } else {
                console.log('AvisoExpirados: No expired articles found.');
                resolve();
            }
        });
    });
}

/**
 * Main Vercel Serverless Function handler.
 * This is the entry point that Vercel will call.
 */
export default async function handler(req, res) {
    console.log('Cron job handler started.');
    try {
        // You should wrap each of these calls in a try-catch for individual error handling
        // and await them to ensure they complete before the function exits.
        await Aviso30dias();
        await Aviso15dias();
        await Aviso7dias();
        await AvisoExpirados();

        console.log('All cron job tasks completed.');
        res.status(200).json({ message: 'Cron job executed successfully for all warnings.' });
    } catch (error) {
        console.error('Unhandled error in cron job handler:', error);
        res.status(500).json({ message: 'Cron job failed with an unhandled error.', error: error.message });
    }
}
