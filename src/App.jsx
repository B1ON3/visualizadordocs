import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, Printer, X } from 'lucide-react';

export default function App() {
  const [pedidoData, setPedidoData] = useState(null);

  // Funções de formatação
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return '';
    const str = cnpj.toString().padStart(14, '0');
    return str.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    const str = cpf.toString().padStart(11, '0');
    return str.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const normalizeText = (value) => {
    return (value || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\uFFFD/g, '')
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .trim();
  };

  const findEmpresaRow = (rows) => {
    const comEmpresa = rows.filter((row) => (row.EMPRESA || '').trim());

    const pernambuco = comEmpresa.find((row) => {
      const nome = normalizeText(row.EMPRESA);
      return nome.includes('PERNAMBUCO') && nome.includes('INVESTIMENTOS');
    });
    const perpart = comEmpresa.find((row) => normalizeText(row.EMPRESA).includes('PERPART'));

    return pernambuco || perpart || comEmpresa[0] || rows[0] || {};
  };

  const readFileText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const bytes = new Uint8Array(event.target.result);
        try {
          resolve(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
        } catch {
          resolve(new TextDecoder('windows-1252').decode(bytes));
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const csvText = await readFileText(file);

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';',
      transformHeader: (header) => header.replace(/^\uFEFF/, '').trim(),
      complete: (results) => {
        const data = results.data;

        // Filtragem dos tipos de lançamento
        const recargas = data.filter(d => d.TIPO_LANC_PEDIDO === 'RECARGA');
        const taxaAdminRows = data.filter(d => d.TIPO_LANC_PEDIDO === 'TAXA ADMINISTRATIVA');
        const taxaBoletoRows = data.filter(d => d.TIPO_LANC_PEDIDO === 'TAXA DE BOLETO');

        // Cálculo dos totais
        const valorRecarga = recargas.reduce((acc, curr) => acc + parseFloat(curr.VALOR_LANCAMENTO || 0), 0);
        const taxaAdmin = taxaAdminRows.reduce((acc, curr) => acc + parseFloat(curr.VALOR_LANCAMENTO || 0), 0);
        const taxaBoleto = taxaBoletoRows.reduce((acc, curr) => acc + parseFloat(curr.VALOR_LANCAMENTO || 0), 0);
        const taxaBoletoNaoPago = 0; // Fixo como 0 conforme imagem ou extrair se existir no CSV
        const valorTotal = valorRecarga + taxaAdmin + taxaBoleto + taxaBoletoNaoPago;

        // Extração dos dados do cabeçalho priorizando a empresa do pedido
        const headerInfo = findEmpresaRow(data);

        // Funcionários em ordem alfabética
        const funcionariosOrdenados = [...recargas].sort((a, b) =>
          (a.FUNCIONARIO || '').localeCompare(b.FUNCIONARIO || '', 'pt-BR', { sensitivity: 'base' })
        );

        setPedidoData({
          info: {
            empresa: headerInfo.EMPRESA,
            cnpj: headerInfo.CNPJ_EMPRESA,
            pedido: headerInfo.NUMERO_PEDIDO,
            dataPedido: headerInfo.DATA_PEDIDO,
            pagarEm: '30/10/2026', // Pode ser ajustado conforme regra de negócio
            vencimento: '10/11/2026', // Pode ser ajustado conforme regra de negócio
            pagamentoLiberacao: headerInfo.DATA_LANCAMENTO,
            autorizador: headerInfo.AUTORIZADOR,
            emailAutorizador: 'VANESSA.MAIOR@PERPART.PE.GOV.BR', // Fixo pelo modelo ou extraído
            produto: headerInfo.PRODUTO
          },
          totais: {
            valorRecarga,
            taxaAdmin,
            taxaBoleto,
            taxaBoletoNaoPago,
            valorTotal,
            quantidadeCartoes: recargas.length
          },
          funcionarios: funcionariosOrdenados
        });
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans text-sm text-gray-800">

      {/* Controles: Visíveis apenas na tela, ocultos na impressão */}
      <div className="print:hidden max-w-5xl mx-auto mb-6 p-4 bg-white rounded-lg shadow flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-700 mb-2">Importador de CSV - VEM</h1>
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded inline-flex items-center gap-2 transition-colors">
            <Upload size={18} />
            Carregar arquivo CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        {pedidoData && (
          <button
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded inline-flex items-center gap-2 transition-colors shadow-sm"
          >
            <Printer size={18} />
            Exportar / Imprimir PDF
          </button>
        )}
      </div>

      {/* Visualizador do Documento (O que será impresso) */}
      {pedidoData && (
        <div className="max-w-5xl mx-auto bg-white p-8 shadow-lg print:shadow-none print:p-0 print:max-w-full relative">

          <button
            onClick={() => setPedidoData(null)}
            title="Fechar"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 print:hidden"
          >
            <X size={24} />
          </button>

          <h2 className="text-center text-xl mb-8 tracking-wide">DETALHAMENTO DO PEDIDO</h2>

          {/* Cabeçalho de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mb-8">
            <div className="flex gap-2"><strong className="w-56">EMPRESA:</strong> <span>{pedidoData.info.empresa}</span></div>
            <div className="flex gap-2"><strong className="w-56">CNPJ:</strong> <span>{formatCNPJ(pedidoData.info.cnpj)}</span></div>
            <div className="flex gap-2"><strong className="w-56">Nº PEDIDO:</strong> <span>{pedidoData.info.pedido}</span></div>
            <div className="flex gap-2"><strong className="w-56">DATA PEDIDO:</strong> <span>{pedidoData.info.dataPedido}</span></div>
            <div className="flex gap-2"><strong className="w-56">PAGAR EM:</strong> <span>{pedidoData.info.pagarEm}</span></div>
            <div className="flex gap-2"><strong className="w-56">VENCIMENTO:</strong> <span>{pedidoData.info.vencimento}</span></div>
            <div className="flex gap-2"><strong className="w-56">VALOR RECARGA (A):</strong> <span>{formatCurrency(pedidoData.totais.valorRecarga)}</span></div>
            <div className="flex gap-2"><strong className="w-56">TAXA ADMINISTRATIVA (B):</strong> <span>{formatCurrency(pedidoData.totais.taxaAdmin)}</span></div>
            <div className="flex gap-2"><strong className="w-56">TAXA BOLETO (C):</strong> <span>{formatCurrency(pedidoData.totais.taxaBoleto)}</span></div>
            <div className="flex gap-2"><strong className="w-56">TAXA BOLETO NÃO PAGO (D):</strong> <span>{formatCurrency(pedidoData.totais.taxaBoletoNaoPago)}</span></div>
            <div className="flex gap-2"><strong className="w-56">VALOR PAGO (E = A + B + C + D):</strong> <span>{formatCurrency(pedidoData.totais.valorTotal)}</span></div>
            <div className="flex gap-2"><strong className="w-56">QUANTIDADE DE CARTÕES NO PEDIDO:</strong> <span>{pedidoData.totais.quantidadeCartoes}</span></div>
            <div className="flex gap-2"><strong className="w-56">PAGAMENTO/LIBERAÇÃO:</strong> <span>{pedidoData.info.pagamentoLiberacao}</span></div>
            <div className="flex gap-2"><strong className="w-56">NOME AUTORIZADOR:</strong> <span>{pedidoData.info.autorizador}</span></div>
            <div className="flex gap-2"><strong className="w-56">EMAIL AUTORIZADOR:</strong> <span>{pedidoData.info.emailAutorizador}</span></div>
            <div className="flex gap-2"><strong className="w-56">PRODUTO:</strong> <span>{pedidoData.info.produto}</span></div>
          </div>

          {/* Tabela de Funcionários */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1c3553] text-white">
                <th className="py-2 px-4 font-semibold w-1/2">FUNCIONARIO</th>
                <th className="py-2 px-4 font-semibold text-center">CPF</th>
                <th className="py-2 px-4 font-semibold text-center">Nº CARTÃO</th>
                <th className="py-2 px-4 font-semibold text-right">VALOR RECARGA</th>
              </tr>
            </thead>
            <tbody>
              {pedidoData.funcionarios.map((func, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 px-4">{func.FUNCIONARIO}</td>
                  <td className="py-3 px-4 text-center">{formatCPF(func.CPF)}</td>
                  <td className="py-3 px-4 text-center">{func.CARTAO}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(parseFloat(func.VALOR_LANCAMENTO || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
