$(document).ready(function (){
    cardapio.eventos.init();
})

var cardapio ={};
var MEU_CARRINHO = [];
var MEU_ENDERECO = null;
var VALOR_CARRINHO = 0;
var VALOR_ENTREGA = 5;
var CELULAR_EMPRESA = '5521988526928';


cardapio.eventos = {

    init: ()  => {
        cardapio.metodos.obterItensCardapio();
        cardapio.metodos.carregarBotaoLigar();
        cardapio.metodos.carregarBotaoReserva();
    }

}

cardapio.metodos = {

    obterItensCardapio: (categoria = 'burgers', vermais = false) => {
        var filtro = MENU[categoria];

        if(!vermais){
            $("#itensCardapio").html('')
            $('#btnVerMais').removeClass('hidden');
        }

        $.each(filtro, (i, e) => {
            let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
            .replace(/\${name}/g, e.name)
            .replace(/\${price}/g, e.price.toFixed(2)
            .replace('.',','))
            .replace(/\${id}/g, e.id);

            if(vermais && i >= 8 && i < 12){
                $("#itensCardapio").append(temp)
            }

            if(!vermais && i < 8) {
                $("#itensCardapio").append(temp)
            }

        })
        $('.container-menu a').removeClass('active')
        $("#menu-" + categoria).addClass('active')
    },

    verMais: () => {

        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1];
        cardapio.metodos.obterItensCardapio(ativo, true);

        $('#btnVerMais').addClass('hidden');
    },

    diminuirQuantidade: (id) => {
        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual > 0) {
            $("#qntd-" + id).text(qntdAtual - 1)
        }
    },

    aumentarQuantidade: (id) => {
        let qntdAtual = parseInt($("#qntd-" + id).text());

        $("#qntd-" + id).text(qntdAtual + 1)
    },

    adicionarAoCarrinho: (id) => {
        let qntdAtual = parseInt($("#qntd-" + id).text());
        if(qntdAtual > 0){

            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];

            let filtro = MENU[categoria];

            let item = $.grep(filtro, (e, i) => {
                return e.id == id
            });
            if(item.length > 0){

                let existe = $.grep(MEU_CARRINHO, (elem, index) => {return elem.id == id});

                if(existe.length > 0) {
                    let objIndex =MEU_CARRINHO.findIndex((obj => obj.id == id));
                    MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual;
                }
                else{
                    item[0].qntd = qntdAtual;
                    MEU_CARRINHO.push(item[0])
                }

                cardapio.metodos.mensagem('Item adicionado com sucesso', 'green')
                $("#qntd-" + id).text(0);

                cardapio.metodos.atualizarBadgeTotal();
            }
        }
    },

    atualizarBadgeTotal: () => {
        var total = 0;

        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd
        })

        if (total > 0) {
            $(".botao-carrinho").removeClass('hidden');
            $(".container-total-carrinho").removeClass('hidden');
        }
        else{
            $(".botao-carrinho").addClass('hidden')
            $(".container-total-carrinho").addClass('hidden');
        }

        $(".badge-total-carrinho").html(total);
    },

    abrirCarrinho: (abrir) => {
        if (abrir){
            $("#modalCarrinho").removeClass('hidden');
            cardapio.metodos.carregarCarrinho();
        }
        else{
            $("#modalCarrinho").addClass('hidden');
        }
    },

    carregarEtapa: (etapa) => {
        if(etapa == 1 ){
            $("#lbltituloEtapa").text('Seu carrinho:');
            $("#itemsCarrinho").removeClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa-1").addClass('active');

            $("#btnEtapaPedido").removeClass('hidden');
            $("#btnEtapaEndereço").addClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").addClass('hidden');
        }

        if(etapa == 2){
            $("#lbltituloEtapa").text('Endereço de Entrega:');
            $("#itemsCarrinho").addClass('hidden');
            $("#localEntrega").removeClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa-1").addClass('active');
            $(".etapa-2").addClass('active');

            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereço").removeClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }

        if(etapa == 3){
            $("#lbltituloEtapa").text('Resumo do Pedido:');
            $("#itemsCarrinho").addClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").removeClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa-1").addClass('active');
            $(".etapa-2").addClass('active');
            $(".etapa-3").addClass('active');

            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereço").addClass('hidden');
            $("#btnEtapaResumo").removeClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }

    },

    voltarEtapa: () => {
        let etapa = $(".etapa.active").length;

        cardapio.metodos.carregarEtapa(etapa-1);
    },

    carregarCarrinho: () => {

        cardapio.metodos.carregarEtapa(1);

        if(MEU_CARRINHO.length > 0){
            $("#itemsCarrinho").html('');
            $.each(MEU_CARRINHO, (i, e) => {
                let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
                .replace(/\${name}/g, e.name)
                .replace(/\${price}/g, e.price.toFixed(2)
                .replace('.',','))
                .replace(/\${id}/g, e.id)
                .replace(/\${qntd}/g, e.qntd);

                $("#itemsCarrinho").append(temp);

                cardapio.metodos.carregarValores();
            })
        }
        else{
            $("#itemsCarrinho").html('<p class="carrinho-vazio"><i class=" fa fa-shopping-bag"></i>Seu carrinho está vazio.</p>')
        }

    },

    diminuirQuantidadeCarrinho: (id) => {
        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

        if(qntdAtual > 1){
            $("#qntd-carrinho-" + id).text(qntdAtual - 1);
            cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
        }
        else{
            cardapio.metodos.removerItemCarrinho(id)
        }
    },

    aumentarQuantidadeCarrinho: (id) => {
        
        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        $("#qntd-carrinho-" + id).text(qntdAtual + 1);
        cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);

    },

    removerItemCarrinho: (id) => {
        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => { return e.id !=id });
        cardapio.metodos.carregarCarrinho();

        cardapio.metodos.atualizarBadgeTotal();
    },

    atualizarCarrinho: (id, qntd) => {
        let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
        MEU_CARRINHO[objIndex].qntd = qntd;

        cardapio.metodos.atualizarBadgeTotal();

        cardapio.metodos.carregarValores();
    },

    carregarValores: () => {

        VALOR_CARRINHO = 0;

        $("#lblSubTotal").text('R$ 0,00');
        $("#lblValorEntrega").text('+ R$ 0,00');
        $("#lblValorTotal").text('R$ 0,00');

        $.each(MEU_CARRINHO, (i, e) => {

            VALOR_CARRINHO += parseFloat(e.price * e.qntd);

            if((i + 1) == MEU_CARRINHO.length){
                $("#lblSubTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}`);
                $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace('.', ',')}`);
                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}`);
            }
        })

    },

    carregarEndereço: () => {

        if(MEU_CARRINHO.length <= 0){
            cardapio.metodos.mensagem('Seu carrinho está vazio.')
            return;
        }

        cardapio.metodos.carregarEtapa(2);
    },

    buscarCEP: () => {
        var cep = $("#txtCEP").val().trim().replace(/\D/g, '');

        if(cep != ""){
            var validacep = /^[0-9]{8}$/;
            if(validacep.test(cep)){
                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function(dados){
                    if(!("erro" in dados)){

                        $("#txtEndereço").val(dados.logradouro);
                        $("#txtBairro").val(dados.bairro);
                        $("#txtCidade").val(dados.localidade);
                        $("#ddlUf").val(dados.uf);
                        $("#txtNumero").focus();

                    }
                    else{
                        cardapio.metodos.mensagem('CEP não encontrado. Preencha as informações manualmente.');
                        $("txtEndereço").focus();
                    }
                })
            }
            else{
                cardapio.mensagem.mensagem('Formato do CEP inválido.');
                $("#txtCEP").focus();

            }

        }
        else{
            cardapio.metodos.mensagem('informe o CEP, por favor.')
            $("#txtCEP").focus();
        }
    },

    resumoPedido: () => {

        let cep = $("#txtCEP").val().trim();
        let endereço = $("#txtEndereço").val().trim();
        let bairro = $("#txtBairro").val().trim();
        let cidade = $("#txtCidade").val().trim();
        let uf = $("#ddlUf").val().trim();
        let numero = $("#txtNumero").val().trim();
        let complemento = $("#txtComplemento").val().trim();

        if(cep.length <= 0){
            cardapio.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCEP").focus();
            return;
        }

        if(endereço.length <= 0){
            cardapio.metodos.mensagem('Informe o endereço, por favor.');
            $("#txtEndereço").focus();
            return;
        }

        if(bairro.length <= 0){
            cardapio.metodos.mensagem('Informe o bairro, por favor.');
            $("#txtBairro").focus();
            return;
        }

        if(cidade.length <= 0){
            cardapio.metodos.mensagem('Informe a cidade, por favor.');
            $("#txtCidade").focus();
            return;
        }

        if(uf == -1){
            cardapio.metodos.mensagem('Informe a UF, por favor.');
            $("#ddlUf").focus();
            return;
        }

        if(numero.length <= 0){
            cardapio.metodos.mensagem('Informe o número, por favor.');
            $("#txtNumero").focus();
            return;
        }

        MEU_ENDERECO = {
            cep: cep,
            endereço: endereço,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento
        }

        cardapio.metodos.carregarEtapa(3);
        cardapio.metodos.carregarResumo();

    },

    carregarResumo: () => {

        $("#listaItemsResumo").html('');

        $.each(MEU_CARRINHO, (i, e) => {
            let temp = cardapio.templates.itemResumo
                .replace(/\${img}/g, e.img)
                .replace(/\${name}/g, e.name)
                .replace(/\${price}/g, e.price.toFixed(2)
                .replace('.',','))
                .replace(/\${qntd}/g, e.qntd);

            $("#listaItemsResumo").append(temp);
        })

        $("#resumoEndereço").html(`${MEU_ENDERECO.endereço}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`);
        $("#cidadeEndereço").html(`${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`);

        cardapio.metodos.finalizarPedido();
    },

    finalizarPedido: () => {
        if(MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {
            var texto = 'Olá, gostaria de fazer um pedido:';
            texto += `\n*Itens do pedido:* \n\n\${itens}`;
            texto += '\n*Endereço de Entrega:*';
            texto += `\n${MEU_ENDERECO.endereço}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
            texto += `\n${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;
            texto += `\n\n*Total (com entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}*`;

            var itens = '';

            $.each(MEU_CARRINHO, (i, e) => {
                itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.', ',')} \n`;

                if((i + 1) == MEU_CARRINHO.length){
                    texto = texto.replace(/\${itens}/g, itens);

                    let encode = encodeURI(texto);
                    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

                    $("#btnEtapaResumo").attr('href', URL);
                }
            })
        }
    },

    carregarBotaoReserva: () => {

        var texto = 'Olá! Gostaria de fazer uma *reserva*';

        let encode = encodeURI(texto);
        let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

        $("#btnReserva").attr('href', URL);

    },

    carregarBotaoLigar: () => {

        $("#btnLigar").attr('href', `tel:${CELULAR_EMPRESA}`);
    },

    abrirTestimonials: (testimonials) => {

        $("#testimonial-1").addClass('hidden');
        $("#testimonial-2").addClass('hidden');
        $("#testimonial-3").addClass('hidden');

        $("#btnTestimonial-1").removeClass('active');
        $("#btnTestimonial-2").removeClass('active');
        $("#btnTestimonial-3").removeClass('active');

        $("#testimonial-" + testimonials).removeClass('hidden');
        $("#btnTestimonial-" + testimonials).addClass('active');

    },

    mensagem: (texto, cor= 'red', tempo = 3500) => {

        let id = Math.floor(Date.now() * Math.random()).toString();

        let msg = `<div id="msg-${id}" class="animated fadeIdDown toast ${cor}">${texto}</div>`;

        $("#container-mensagens").append(msg),

        setTimeout(() => {
            $("#msg-" + id).removeClass('fadeInDown');
            $("#msg-" + id).addClass('fadeOutUp');
            $("#msg-" + id).remove();
        }, tempo)
    }
}

cardapio.templates = {
    item: `
        <div class="col-12 col-lg-3 mb-5">
            <div class="card card-item id="\${id}">
                <div class="img-produto">
                    <img src="\${img}" alt="">
                </div>
                <p class="title-produto text-center mt-4">
                    <b>\${name}</b>
                </p>
                <p class="price-produto text-center">
                    <b>R$ \${price}</b>
                </p>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-items" id="qntd-\${id}">0</span>
                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
                </div>
            </div>
        </div>
    `,

    itemCarrinho: `
        <div class="col-12 item-carrinho">
            <div class="img-produto">
                <img src="\${img}" alt="">
            </div>
            <div class="dados-produto">
                <p class="title-produto"><b>\${name}</b></p>
                <p class="price-produto"><b>R$ \${price}</b></p>
            </div>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-items" id="qntd-carrinho-\${id}">\${qntd}</span>
                <span class="btn-mais"><i class="fas fa-plus" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"></i></span>
                <span class="btn btn-remove no-mobile"><i class="fa fa-times" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"></i></span>
            </div>
        </div>
    `,

    itemResumo: `
        <div class="col-12 item-carrinho resumo">
            <div class="img-produto-resumo">
                <img src="\${img}" alt="">
            </div>
            <div class="dados-produto">
                <p class="title-produto-resumo">

                    <b>\${name}</b>
                </p>
                <p class="price-produto-resumo">
                    <b>R$ \${price}</b>
                </p>
            </div>
            <p class="quantity-produto-resumo">
                x <b>\${qntd}</b>
            </p>
        </div>
    `
}
