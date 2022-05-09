#! /usr/bin/env node
const { exec } = require('child_process');
const path = require("path");

const clc = require('cli-color');
const green = clc.green;
const red = clc.red;
const yellow = clc.yellow;
const blue = clc.blue;

const api = "https://api.bitpreco.com/btc-brl/";
const ticker = api + "ticker";
const orderbook = api + "orderbook";
const trades = api + "trades";

let history = [];

function getJSON(url) {

	const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
	const request = new XMLHttpRequest();

	request.open('GET', url, false);
	request.send();

	let data = JSON.parse(request.responseText);

	return data;
}

function getCor(dados) {
	if (dados > 0) {
		dados = green.bold(dados);
		exec('play buy.mp3');
		
		return dados;
	}

	if (dados < 0) {
		dados = red.bold(dados);
		exec('play sell.mp3');

		return dados;
	}
}

function negociacao() {

	let dados = getJSON(ticker);
	let atual = dados.last;
	let min = dados.low;
	let max = dados.high;
	let variacao = getCor(parseFloat(dados.last - history[history.length -2]).toFixed(2)) || 0;

	if(parseFloat(atual).toFixed(2) !== history[history.length - 2]) {

		console.log("\n*******\n" + green(parseInt(min)) + "\n " + yellow.bold(parseInt(atual)) + " " + variacao + "\n" + red(parseInt(max)) + "\n*******\n");

	}
}

function getColor(number) {

	if (number > 0) {
		let resposta = green.bold(number + "%");
		return resposta;
	}

	if (number < 0) {
		let resposta = red.bold(number + "%");
		return resposta;
	}
}

function imprimeTicker() {

	let dados = getJSON(ticker);
	let price = dados.last;
	let timestamp = dados.timestamp;
	let melhorComprador = dados.buy;
	let melhorVendedor = dados.sell;
	let market = dados.market;
	let maior24H = dados.high;
	let menor24H = dados.low;
	let variacao24H = getColor(dados.var);
	let media = dados.avg;

	const lastPrice = "**********\n\nÚltimo preço registrado: " + yellow("R$" + parseFloat(price).toFixed(2)) + "\n";
	const compra  = "\nMelhor comprador: " + green("R$" + parseFloat(melhorComprador).toFixed(2));
	const venda = "\nMelhor vendedor: " + yellow.bold("R$" + parseFloat(melhorVendedor).toFixed(2));
	const lowHigh = "\nVariação em 24 Horas: " + variacao24H + "\n\nMenor Preço: " + blue("R$" + parseFloat(menor24H).toFixed(2)) + "\nMaior Preço: " + red("R$" + parseFloat(maior24H).toFixed(2));

	console.log(lastPrice + venda + compra + lowHigh);
}

function apagarPreco() {
	history.splice(0, 1);
}

function registrarPreco() {
	const minutes = 30;
	let dados = getJSON(ticker);
	let anterior = history[history.length - 1];
	let price = parseFloat(dados.last).toFixed(2);
	
	if (price !== anterior) {
		history.push(price);
		setTimeout(apagarPreco, minutes * 60 * 1000);
		//console.log(history);

		negociacao();

		let min = green(parseFloat(Math.min(...history)).toFixed(2));
		let max = red(parseFloat(Math.max(...history)).toFixed(2));

		console.log("Min(30m): " + green("R$") + min);
		console.log("Max(30m): " + red("R$") + max);
	}

}

async function main() {

	console.log('Iniciando Programa...\n');
	const welcome = "Bem-Vind@ usuári@! Aqui você verá um resumo de mercado:\n";
	console.log(green.bold(welcome));

	await imprimeTicker();
	setInterval(registrarPreco, 5000);
	//negociacao();
}

main();
