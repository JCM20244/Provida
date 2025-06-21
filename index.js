const express  = require('express');
// const session = require('express-session');
const cron = require('node-cron');
const nodemailer =require('nodemailer');
const app = express();
const cors = require('cors');
const port  = process.env.PORT || 5000;
const db = require('./db.config');
const borderParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const authRouter = require('./routes/auth');
const protectedRoutes = require('./routes/Protected');

app.use(borderParser.urlencoded({extended: true}));
app.use(borderParser.json());
// Configuração do CORS
app.use(cors({
    origin: 'https://htecs.vercel.app',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204 // For preflight requests
}));

app.use(express.json());
// Configuração do middleware de sessão
// app.use(session({
//     secret: process.env.SECRET_SESSION,
//     resave: false,
//     saveUninitialized: false,
//     cookie:{
//         secure: false,
//         httpOnly: true,
//         maxAge: 1000 * 60 * 60 * 24 // 1 dia em milissegundos
//     }
// }));
// Middleware para verificar o token JWT
app.use('/api/auth', authRouter);
app.use('/api', protectedRoutes);
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
  function Aviso30dias(){
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
                    if(!errs){
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
                    if(!errs){
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
                 db.query('INSERT INTO ArtigoExpirado(artigo,dataExp) VALUES (?,Now())',[item.artigo], function(erros,resulti){
                    if(!erros){
                        console.log('Artigo Reportado com sucesso!');
                    }
                });
                db.query('Update Artigo SET estado =?  where codigo=?',['EXPIRADO',item.artigo],function(errs,results){
                    if(!errs){
                        console.log('Artigo actualizado com sucesso!');
                    }
                });
               
            });
        }
    });
  }

  //funcao de notificacao
  cron.schedule('* * * * *', function () {
    //query para emitir uma mensagem de aviso de 30 dias
    Aviso30dias();
    //query para emitir uma mensagem de aviso de 15 dias
    Aviso15dias();   
    //query para emitir uma mensagem de aviso de 7 dias
    Aviso7dias(); 
    //query para emitir uma mensagem de aviso de artigo expirado
    AvisoExpirados();
        //fim
    });

//API's
//API que retorna o numero de dias para expirar
function getNumDays(expadate2){
    const currentDate = new Date();
    const expdate = new Date(expadate2);
    const timeDiff = expdate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const estados = ['VALIDO','AVISO','EXPIRADO'];

    if(daysDiff>30){
        return estados[0];
    }else if(daysDiff<=30 && daysDiff>0){
        return estados[1];
    }
    else if(daysDiff<=0){
        return estados[2];
    }
    
}
//API que retorna todos os artigos
app.get('/device', (req,res)=>{
    db.query('SELECT * from reagente where id not in (select idreagent from expireddate)', function(err,result){
        if(err){
            res.json({message: 'Fatal Error'});
        }else{
            res.json({message: result});
        }
    });
   
});
//API que retorna o utilizador logado
app.post('/cadastroUtilizador',async(req,res)=>{
    const {username, password, previlegio, email} = req.body;
    const senha= await bcrypt.hash(password,8);
    db.query('INSERT INTO Utilizador (username,password,previlegio, email) values(?,?,?,?)',[username,senha,previlegio,email], function(err, result){
        if(err){
            res.json({message: 'Nao foi possivel inserir utilizador'})
        }else{
            res.json({message: 'Parabens o utilizador foi inserido com sucesso!'});
        }
    });
});
//API que lista os previlegios
app.get('/lista_previlegios', (req, res)=>{
   
    db.query('SELECT codigo as previlegio, descricao from previlegio_view',function(err, result){
        if (err){
            res.json({message: 'Lista de previlegio nao encontrado.'});
        }else{
            res.json({message: result});
        }

    });
});
//API que lista os utilizadores e seus previlegios
app.get('/utilizador_previlegio',(req,res)=>{
    db.query('SELECT * from utilizador_previlegio_view', function(err,result){
        if(err){
            res.json({message: 'Lista de previlegios nao encontrados'});
        }else{
            res.json({message: result});
        }
    });
});
//API que lista os artigos
app.get('/lista_artigos', (req,res)=>{
    db.query('SELECT * from lista_artigo_view', function(err,result){
        if(err){
            res.json({message: 'No view is founded'});
        }else{
            res.json({message: result});
        }
    });
   
});

//API que lista os artigos agendados em estado de aviso
app.get('/lista_artigo_Agendados',(req,res)=>{

    db.query('SELECT * FROM lista_artigo_Agendados_view',function (err,result){
        if(err){
            res.json({message: 'Ocorreu um erro nenhuma lista de Artigo encontrado'});
        }else{
            res.json({message: result});
        }
    });
});
//API que lista fornecedores
app.get('/fornecedor_view', (req,res)=>{
    db.query('SELECT * from fornecedor_view', function(err,result){
        if(err){
            res.json({message: 'No view is founded'});
        }else{
            res.json({message: result});
        }
    }); 
});
//API que lista fornecedores por nome
app.get('/fornecedor_nome_view', (req,res)=>{
    db.query('SELECT * from fornecedor_nome_view', function(err,result){
        if(err){
            res.json({message: 'No view is founded'});
        }else{
            res.json({message: result});
        }
    });
});
//API que lista categorias por descricao
app.get('/categoria_descricao_view', (req,res)=>{
    db.query('SELECT * from categoria_descricao_view', function(err,result){
        if(err){
            res.json({message: 'No view is founded'});
        }else{
            res.json({message: result});
        }
    });
});
//API que lista categorias por tipo
app.get('/categoria_tipo_view', (req,res)=>{
    db.query('SELECT * from categoria_tipo_view', function(err,result){
        if(err){
            res.json({message: 'No view is founded'});
        }else{
            res.json({message: result});
        }
    });
});
//API que lista categorias 
app.get('/categoria_view', (req,res)=>{
    db.query('SELECT * from categoria_view', function(err,result){
        if(err){
            res.json({message: 'No view is founded'});
        }else{
            res.json({message: result});
        }
    });
});
//API que lista artigos reportados fora da validade
app.get('/lista_reported_artigo', (req,res)=>{
    db.query('SELECT * from reported_artigo_view', function(err,result){
        if(err){
            res.json({message: 'No view data is founded'});
        }else{
            res.json({message: result});
        }
    });
});
//API que lista fornecedores por provincia
app.get('/fornecedor_provincia_view', (req,res)=>{    
    db.query('SELECT * from fornecedor_provincia_view', function(err,result){
        if(err){
            res.json({message: 'No view data is founded'});
        }else{
            res.json({message: result});
        }
    });
});
//API que lista provincias
app.get('/provincia_view', (req,res)=>{   
    db.query('SELECT * from provincia_view', function(err,result){
        if(err){
            res.json({message: 'No view data is founded'});
        }else{
            res.json({message: result});
        }
    });
});
//API de pesquisa de artigos no formulario de pesquisa no frontend artigo novo
app.put('/artigos_search', (req,res)=>{
    const search = req.body.search;
    db.query('SELECT * from artigos_search_view where referencia like ? or lote like ?',[`%${search}%`, `%${search}%`], function(err,result){
        if(err){
            res.json({message: 'Nenhuma view encontrada!'});
        }else{
            res.json({message: result});
        }
    });
});
//API de pesquisa de artigos na tabela lista_artigo_view
app.put('/artigos_search_table', (req,res)=>{
    const search = req.body.search;
    db.query('SELECT * from lista_artigo_view where referencia like ? or lote like ?',[`%${search}%`, `%${search}%`], function(err,result){
        if(err){
            res.json({message: 'Nenhuma view encontrada!'});
        }else{
            res.json({message: result});
        }
    });
});
//API de cadastro de artigo
app.post('/cadastrarArtigo',(req,res)=>{
   const {referencia, lote, categoria, quatidade,prodData, expData,fornecedor} = req.body;
   const user = 7;
   const estado = getNumDays(expData);
   
   db.query('INSERT INTO Artigo (referencia, lote, categoria, quatidade,prodData, expData,fornecedor,usuario, estado) values(?,?,?,?,?,?,?,?,?)',[referencia, lote, categoria, quatidade,prodData, expData,fornecedor,user,estado],function(err,result){  
       if(err){
           res.json({message: "Ocorreu um erro ao cadastrar o artigo!"});
       }else{
           res.json({message: 'Parabens o artigo foi cadastrado com sucesso!'});
       }
   });
});
//API de cadastro de Categoria
app.post('/cadastrarCategoria',(req,res)=>{
    const {descricao , tipo}= req.body;
    db.query('INSERT INTO Categoria (descricao, tipo) values(?,?)',[descricao, tipo],function(err,result){
        if(err){
            res.json({message: 'Ocorreu um erro ao cadastrar a categoria!'});
        }else{
            res.json({message: result});
        }
    });
});
//cadastrar fornecedor
app.post('/cadastrarFornecedor',(req,res)=>{
    const {nome, provincia, contacto} = req.body;
    db.query('INSERT INTO Fornecedor (nome, provincia, contacto) values(?,?,?)',[nome, provincia, contacto],function(err,result){
        if(err){
            res.json({message: 'Ocorreu um erro ao cadastrar o fornecedor!'});
        }else{
            res.json({message: result});
        }
    });
});
//API de actualizacao do artigo
app.put('/update/:id',(req,res)=>{
    const{referencia, lote, categoria, expdate,prodDate, fornecedor,quantity} = req.body;
    const ID = req.params.id;
    
    db.query('UPDATE Artigo SET categoria=?,referencia=?,lote=?,prodData=?,expData=?,fornecedor=?, quatidade=? WHERE codigo=?',[categoria,referencia,lote,prodDate,expdate,fornecedor,quantity,ID],function(err,result){
        if(err){
            res.json({message: 'error'});
        }else{
            res.json({message: result });
        }
    });
});
//API para remove um artigo
app.delete('/delete/:id',(req,res)=>{
    const codigo = req.params.id;
    db.query('DELETE FROM Artigo WHERE codigo=?',[codigo],function(err,result){
        if(err){
            res.json({message: 'Error to delete row'});
        }else{
            res.json({message: result});
        }
    });
});
app.get('/',(req,res)=>{
    res.json({message: 'Hello Server'});
});
// Listening to the server
app.listen(port, ()=>{
    console.log(`The server ${port}run...`);
});

