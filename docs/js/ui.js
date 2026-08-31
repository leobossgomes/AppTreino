/* Ferramentas de interface usadas por todas as telas:
   criação de elementos, listas agrupadas e janelas (modais). */

const UI = (function () {

  /** Cria um elemento HTML.
      el('div', { class: 'grupo' }, [filho1, filho2]) */
  function el(tag, props, filhos) {
    const node = document.createElement(tag);

    for (const [chave, valor] of Object.entries(props || {})) {
      if (valor === null || valor === undefined || valor === false) continue;
      if (chave === 'class') node.className = valor;
      else if (chave === 'texto') node.textContent = valor;
      else if (chave === 'html') node.innerHTML = valor;
      else if (chave.startsWith('on') && typeof valor === 'function') {
        node.addEventListener(chave.slice(2), valor);
      } else if (chave === 'dataset') Object.assign(node.dataset, valor);
      else node.setAttribute(chave, valor === true ? '' : valor);
    }

    for (const filho of [].concat(filhos === undefined ? [] : filhos)) {
      if (filho === null || filho === undefined || filho === false) continue;
      node.appendChild(
        typeof filho === 'object' ? filho : document.createTextNode(String(filho))
      );
    }
    return node;
  }

  /** Vários elementos soltos, sem uma div em volta. */
  function grupoDeElementos(filhos) {
    const frag = document.createDocumentFragment();
    for (const filho of [].concat(filhos)) {
      if (filho) frag.appendChild(filho);
    }
    return frag;
  }

  function tituloSecao(texto) {
    return el('div', { class: 'secao-titulo', texto });
  }

  /** Uma linha de lista, no estilo das listas do iOS. */
  function item(opcoes) {
    const { titulo, sub, valor, icone, seta, aoTocar, estatico } = opcoes;
    return el(aoTocar ? 'button' : 'div', {
      class: 'item' + (estatico || !aoTocar ? ' estatico' : ''),
      type: aoTocar ? 'button' : null,
      onclick: aoTocar || null
    }, [
      icone ? el('span', { class: 'icone-grupo', texto: icone }) : null,
      el('span', { class: 'item-corpo' }, [
        el('span', { class: 'item-titulo', texto: titulo }),
        sub ? el('span', { class: 'item-sub', texto: sub }) : null
      ]),
      valor ? el('span', { class: 'item-valor', texto: valor }) : null,
      seta ? el('span', { class: 'seta', texto: '›' }) : null
    ]);
  }

  function vazio(emoji, titulo, mensagem) {
    return el('div', { class: 'vazio' }, [
      el('span', { class: 'emoji', texto: emoji }),
      el('h2', { texto: titulo }),
      el('p', { texto: mensagem })
    ]);
  }

  function stat(rotulo, valor) {
    return el('div', { class: 'stat' }, [
      el('div', { class: 'rotulo', texto: rotulo }),
      el('div', { class: 'valor', texto: valor })
    ]);
  }

  // ---------- Modais ----------

  let aoFecharPendente = null;

  function abrirModal(filhos, aoFechar) {
    const fundo = document.getElementById('fundo-modal');
    aoFecharPendente = aoFechar || null;
    fundo.innerHTML = '';
    fundo.appendChild(el('div', { class: 'modal' }, filhos));
    fundo.hidden = false;
  }

  function fecharModal() {
    const fundo = document.getElementById('fundo-modal');
    if (fundo.hidden) return;
    fundo.hidden = true;
    fundo.innerHTML = '';
    const callback = aoFecharPendente;
    aoFecharPendente = null;
    if (callback) callback();
  }

  /** Pergunta sim/não. Devolve uma Promise com true ou false. */
  function confirmar({ titulo, mensagem, textoOk = 'Confirmar', perigo = false }) {
    return new Promise((resolver) => {
      let respondido = false;
      const responder = (valor) => {
        respondido = true;
        fecharModal();
        resolver(valor);
      };
      abrirModal([
        el('h2', { texto: titulo }),
        mensagem ? el('p', { class: 'aviso', texto: mensagem }) : null,
        el('div', { class: 'acoes' }, [
          el('button', {
            class: 'botao ' + (perigo ? 'destrutivo' : 'primario'),
            onclick: () => responder(true)
          }, textoOk),
          el('button', { class: 'botao', onclick: () => responder(false) }, 'Cancelar')
        ])
      ], () => { if (!respondido) resolver(false); });
    });
  }

  /** Menu com uma lista de ações. Cada ação: { texto, perigo, aoTocar } */
  function menu(titulo, acoes) {
    abrirModal([
      el('h2', { texto: titulo }),
      el('div', { class: 'acoes' }, [
        ...acoes.map((a) => el('button', {
          class: 'botao' + (a.perigo ? ' destrutivo' : ''),
          onclick: () => { fecharModal(); a.aoTocar(); }
        }, a.texto)),
        el('button', { class: 'botao', onclick: fecharModal }, 'Cancelar')
      ])
    ]);
  }

  return {
    el, grupoDeElementos, tituloSecao, item, vazio, stat,
    abrirModal, fecharModal, confirmar, menu
  };
})();
