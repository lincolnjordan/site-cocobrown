// TODO - Resolver a porra do problema da Header 
'use strict';
document.addEventListener('DOMContentLoaded', function() {

    // validação 
    function sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function sanitizeURL(url) {
        if (typeof url !== 'string') return '';
        if (/^(javascript|data|vbscript|file|about):/i.test(url)) {
            return '';
        }
        return url;
    }

    function sanitizeNumber(num, defaultValue = 0) {
        const parsed = parseFloat(num);
        return isNaN(parsed) || !isFinite(parsed) || parsed < 0 ? defaultValue : parsed;
    }

    const preloader = document.querySelector('.preloader');
    window.addEventListener('load', () => {
        preloader.classList.add('hidden');
    });

    const produtosDB = [{
        id: 1,
        nome: "Brownie Prestígio",
        preco: 18,
        imagem: "imagens/CardProduto.jpeg",
        descricao: "A combinação perfeita de brownie de chocolate com uma generosa camada de coco cremoso, coberto com chocolate meio amargo. Uma explosão de sabor que derrete na boca!",
        categoria: "premium",
        badge: "Exclusivo"
        // adicionar mais produtos quando o gti fornecer as imagens (pedimos há 3 semanas...)
    }];

    function gerarChecksum(obj) {
        const str = JSON.stringify(obj);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
    
    const produtosChecksums = {};
    produtosDB.forEach(produto => {
        produtosChecksums[produto.id] = gerarChecksum({
            id: produto.id,
            preco: produto.preco
        });
    });

    const produtosGrid = document.querySelector('.produtos-grid');

    function renderizarProdutos(produtosParaRenderizar) {
        if (!produtosGrid) return;
        produtosGrid.innerHTML = '';
        produtosParaRenderizar.forEach(produto => {
            const badgeHTML = produto.badge ? `<div class="produto-badge">${produto.badge}</div>` : '';
            const card = document.createElement('div');
            card.className = 'produto-card';
            card.innerHTML = `
                ${badgeHTML}
                <div class="produto-imagem-container">
                    <img src="${produto.imagem}" alt="${produto.nome}">
                </div>
                <div class="produto-info">
                    <h3 class="produto-nome">${produto.nome}</h3>
                    <p class="produto-desc">${produto.descricao}</p>
                    <div class="produto-preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="produto-actions">
                    <button class="btn-adicionar" data-id="${produto.id}">
                        <i class="fas fa-shopping-cart"></i> Comprar
                    </button>
                    <button class="btn-lightbox" data-src="${produto.imagem}" aria-label="Ampliar Imagem">
                        <i class="fas fa-search-plus"></i>
                    </button>
                    <button class="btn-quick-view" data-id="${produto.id}" aria-label="Visualização Rápida">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            `;
            produtosGrid.appendChild(card);
        });
        setupProdutoListeners();
    }

    renderizarProdutos(produtosDB);


    const toastContainer = document.querySelector('.toast-container');

    function showToast(message, type = 'success') {
        // Notificação 
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
            <div class="toast-progress"></div>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => toast.classList.add('toast-show'), 10);
        
        // Remove depois de 4 segundos
        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
    
    function createConfetti(x, y) {
        const colors = ['#FF7043', '#FFC107', '#5D4037', '#FF8A65', '#FFD54F'];
        const confettiCount = 30;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = x + 'px';
            confetti.style.top = y + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
            confetti.style.setProperty('--ty', (Math.random() - 0.5) * 200 - 100 + 'px');
            confetti.style.setProperty('--rotation', Math.random() * 360 + 'deg');
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 1000);
        }
    }

    // ===== MODO CLARO/ESCURO (dark mode) =====
    const themeSwitch = document.querySelector('.theme-switch');
    const themeIcon = themeSwitch.querySelector('i');

    // Sincroniza o ícone com o tema atual (lua se escuro, sol se claro)
    function syncThemeIcon() {
        const isDark = document.documentElement.classList.contains('dark-mode');
        themeIcon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    }
    syncThemeIcon();

    // Aplica o tema e salva a preferência
    function applyTheme(tema) {
        if (tema === 'dark') {
            document.documentElement.classList.add('dark-mode');
            themeIcon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark-mode');
            themeIcon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'light');
        }
    }

    // Quando clica no botão de tema, troca entre claro e escuro
    // (com animação suave se o navegador suportar)
    themeSwitch.addEventListener('click', () => {
        const novoTema = document.documentElement.classList.contains('dark-mode') ? 'light' : 'dark';
        
        // Se o usuário prefere animações reduzidas, não faz efeito 
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            applyTheme(novoTema);
            return;
        }
        
        // Animação do botão
        themeSwitch.classList.add('transitioning');
        setTimeout(() => themeSwitch.classList.remove('transitioning'), 600);
        
        // View Transition API (só funciona em Chrome/Edge novos)
        // alguém testa se isso tá funcionando em outros navegadores ai namoral
        if (document.startViewTransition) {
            document.startViewTransition(() => applyTheme(novoTema));
            return;
        }
        
        // Se não tiver API nova, usa overlay suave mesmo
        const overlay = document.getElementById('theme-overlay');
        if (overlay) {
            // Escolhe a cor do overlay baseado no tema novo
            overlay.style.background = novoTema === 'dark' 
                ? 'radial-gradient(circle at center, rgba(26, 26, 46, 0.95) 0%, rgba(13, 12, 11, 0.98) 60%, #000000 100%)' 
                : 'radial-gradient(circle at center, rgba(255, 248, 220, 0.95) 0%, rgba(255, 250, 205, 0.98) 60%, #FFF8DC 100%)';
            
            // Fade in do overlay (300ms)
            overlay.classList.add('active');
            
            // Aplica o tema no meio (350ms)
            setTimeout(() => {
                applyTheme(novoTema);
            }, 350);
            
            // Começa a desaparecer (600ms)
            setTimeout(() => {
                overlay.classList.add('fading-out');
            }, 600);
            
            // Remove as classes quando acaba (1100ms)
            setTimeout(() => {
                overlay.classList.remove('active', 'fading-out');
            }, 1100);
        } else {
            applyTheme(novoTema);
        }
    });

    // Se o SO do usuário mudar pra modo escuro/claro e ele não salvou preferência, segue o SO
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });



    const faqContainer = document.querySelector('.faq-container');
    if (faqContainer) {
        // FAQ - clica em uma pergunta e ela abre/fecha a resposta
        faqContainer.addEventListener('click', (e) => {
            const faqPergunta = e.target.closest('.faq-pergunta');
            if (faqPergunta) {
                const faqItem = faqPergunta.parentElement;
                faqItem.classList.toggle('ativo');
            }
        });
    }

    // ===== CARROSSEL DO HERO =====
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        const slider = carousel.querySelector('.hero-carousel-slider');
        const slides = carousel.querySelectorAll('.hero-carousel-slide');
        const prevBtn = carousel.querySelector('.hero-carousel-btn.prev');
        const nextBtn = carousel.querySelector('.hero-carousel-btn.next');
        const dotsContainer = carousel.querySelector('.hero-carousel-dots');
        let currentIndex = 0;
        let slideInterval;

        // Cria os pontinhos de navegação (uma por slide)
        if (slides.length > 0) {
            slides.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.classList.add('hero-carousel-dot');
                dot.addEventListener('click', () => {
                    goToSlide(i);
                    resetInterval();
                });
                dotsContainer.appendChild(dot);
            });
        }

        const dots = dotsContainer.querySelectorAll('.hero-carousel-dot');

        // Atualiza qual ponto tá destacado
        function updateDots() {
            dots.forEach((dot, i) => dot.classList.toggle('ativo', i === currentIndex));
        }

        // Vai pra um slide específico
        function goToSlide(index) {
            currentIndex = index;
            slider.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateDots();
        }

        // Próximo slide
        function nextSlide() {
            goToSlide((currentIndex + 1) % slides.length);
        }

        // Slide anterior
        function prevSlide() {
            goToSlide((currentIndex - 1 + slides.length) % slides.length);
        }

        // Começa a passar slides automaticamente
        function startInterval() {
            slideInterval = setInterval(nextSlide, 7000);
        }

        // Para e reinicia o intervalo (pra resetar quando o usuário interage)
        function resetInterval() {
            clearInterval(slideInterval);
            startInterval();
        }
        
        // Pausa quando mouse entra, continua quando sai
        carousel.addEventListener('mouseenter', () => clearInterval(slideInterval));
        carousel.addEventListener('mouseleave', startInterval);

        // Botões de seta
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetInterval();
        });

        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetInterval();
        });
        
        // ===== DETECÇÃO DE SWIPE (TOQUE) =====
        let touchStartXCarousel = 0;
        let touchEndXCarousel = 0;
        let touchStartTime = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            touchStartXCarousel = e.changedTouches[0].screenX;
            touchStartTime = Date.now();
        }, { passive: true });
        
        carousel.addEventListener('touchend', (e) => {
            touchEndXCarousel = e.changedTouches[0].screenX;
            const touchDuration = Date.now() - touchStartTime;
            handleCarouselSwipe(touchDuration);
        }, { passive: true });
        
        // Interpreta o swipe (se foi rápido e pro lado, troca slide)
        function handleCarouselSwipe(duration) {
            const swipeThreshold = 50;
            const timeThreshold = 500;
            
            if (duration < timeThreshold) {
                if (touchStartXCarousel - touchEndXCarousel > swipeThreshold) {
                    nextSlide();
                    resetInterval();
                } else if (touchEndXCarousel - touchStartXCarousel > swipeThreshold) {
                    prevSlide();
                    resetInterval();
                }
            }
        }

        // Inicia o carrossel
        if (slides.length > 0) {
            goToSlide(0);
            startInterval();
        }
    }

    // ===== MENU MOBILE =====
    const btnMobile = document.querySelector('.btn-menu-mobile');
    const navegacao = document.querySelector('.navegacao');
    const menuLinks = document.querySelectorAll('.navegacao a');

    // Abre/fecha o menu quando clica no ícone
    function toggleMenu(event) {
        if (event.type === 'touchstart') event.preventDefault();
        navegacao.classList.toggle('ativo');
        const ativo = navegacao.classList.contains('ativo');
        event.currentTarget.setAttribute('aria-expanded', ativo);
        if (ativo) {
            document.body.classList.add('menu-aberto');
            // ativa o backdrop quando o menu abre
            const bd = document.getElementById('carrinho-backdrop');
            if (bd) bd.classList.add('ativo');
        } else {
            document.body.classList.remove('menu-aberto');
            // remove o backdrop somente se o carrinho não estiver aberto
            const bd = document.getElementById('carrinho-backdrop');
            const carrinhoAberto = document.querySelector('.carrinho-sidebar')?.classList.contains('ativo');
            if (bd && !carrinhoAberto) bd.classList.remove('ativo');
        }
    }

    // Detecção de swipe pra fechar o menu arrastando
    if (navegacao) {
        let touchStartX = 0;
        let touchEndX = 0;
        
        navegacao.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        navegacao.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        // Fecha menu se arrastar pra esquerda (de forma rápida)
        function handleSwipe() {
            if (navegacao.classList.contains('ativo')) {
                if (touchStartX - touchEndX > 50) {
                    navegacao.classList.remove('ativo');
                    document.body.classList.remove('menu-aberto');
                    btnMobile.setAttribute('aria-expanded', 'false');
                    // remove backdrop se o carrinho não estiver aberto
                    const bd = document.getElementById('carrinho-backdrop');
                    const carrinhoAberto = document.querySelector('.carrinho-sidebar')?.classList.contains('ativo');
                    if (bd && !carrinhoAberto) bd.classList.remove('ativo');
                }
            }
        }
    }

    if (btnMobile) {
        btnMobile.addEventListener('click', toggleMenu);
        btnMobile.addEventListener('touchstart', toggleMenu);
    }

    // Fecha o menu quando clica em um link
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            navegacao.classList.remove('ativo');
            document.body.classList.remove('menu-aberto');
            btnMobile.setAttribute('aria-expanded', 'false');
            const bd = document.getElementById('carrinho-backdrop');
            const carrinhoAberto = document.querySelector('.carrinho-sidebar')?.classList.contains('ativo');
            if (bd && !carrinhoAberto) bd.classList.remove('ativo');
        });
    });    // ===== HEADER ESCONDE/MOSTRA AO ROLAR =====
    const header = document.querySelector('.cabecalho');
    let lastScrollY = window.scrollY;
    if (header) {
        let headerTimeout;
        // Quando rola pra baixo, esconde o header. Quando rola pra cima, mostra novamente
        // (alguém testa se tá fluido e sem lag em mobile)
        function handleHeaderScroll() {
            if (headerTimeout) {
                window.cancelAnimationFrame(headerTimeout);
            }
            headerTimeout = window.requestAnimationFrame(() => {
                header.classList.toggle('scrolled', window.scrollY > 50);
                if (lastScrollY < window.scrollY && window.scrollY > 150) {
                    header.classList.add('hidden');
                } else {
                    header.classList.remove('hidden');
                }
                lastScrollY = window.scrollY;
            });
        }
        
        window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    }

    const animeScrollElements = document.querySelectorAll('[data-anime="scroll"]');
    if (animeScrollElements.length) {
        // Faz elementos aparecerem com animação quando entram na tela
        const windowMetade = window.innerHeight * 0.7;

        function animaScroll() {
            animeScrollElements.forEach(element => {
                if (element.getBoundingClientRect().top < windowMetade) {
                    element.classList.add('visivel');
                }
            });
        }
        
        let scrollTimeout;
        function debouncedAnimaScroll() {
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }
            scrollTimeout = window.requestAnimationFrame(animaScroll);
        }
        
        animaScroll();
        window.addEventListener('scroll', debouncedAnimaScroll, { passive: true });
    }

    // ===== MODAIS (LIGHTBOX + QUICK VIEW) =====
    const lightbox = document.getElementById('lightbox');
    const quickView = document.getElementById('quick-view');

    function openModal(modal) {
        modal.classList.add('ativo');
        document.body.classList.add('no-scroll');
    }

    function closeModal(modal) {
        modal.classList.remove('ativo');
        document.body.classList.remove('no-scroll');
    }

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeModal(this);
        });
        modal.querySelector('.modal-fechar').addEventListener('click', () => closeModal(modal));
    });

    // Fecha modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.ativo').forEach(modal => {
                closeModal(modal);
            });
            if (carrinhoSidebar && carrinhoSidebar.classList.contains('ativo')) {
                carrinhoSidebar.classList.remove('ativo');
                document.body.classList.remove('carrinho-aberto');
                const bd = document.getElementById('carrinho-backdrop');
                const menuAberto = document.querySelector('.navegacao')?.classList.contains('ativo');
                if (bd && !menuAberto) bd.classList.remove('ativo');
            }
            if (navegacao && navegacao.classList.contains('ativo') && btnMobile) {
                toggleMenu({ currentTarget: btnMobile, type: 'click' });
            }
        }
    });

    function setupProdutoListeners() {
        document.querySelectorAll('.btn-lightbox').forEach(btn => btn.addEventListener('click', (e) => {
            lightbox.querySelector('.lightbox-imagem').src = e.currentTarget.dataset.src;
            openModal(lightbox);
        }));

        document.querySelectorAll('.btn-quick-view').forEach(btn => btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const produto = produtosDB.find(p => p.id === parseInt(id));
            if (produto) {
                document.getElementById('quick-view-img').src = produto.imagem;
                document.getElementById('quick-view-nome').textContent = produto.nome;
                document.getElementById('quick-view-desc').textContent = produto.descricao;
                document.getElementById('quick-view-preco').textContent = formatarPreco(produto.preco);
                const quickViewBtn = document.getElementById('quick-view-btn');
                quickViewBtn.dataset.id = produto.id;
                quickViewBtn.textContent = 'Adicionar ao Carrinho';
                quickViewBtn.classList.remove('adicionado');
                openModal(quickView);
            }
        }));
        
        // Efeito 3D removido pq tava lagado
    }

    const CART_STORAGE_KEY = 'cocobrown_carrinho';
    const CART_TIMESTAMP_KEY = 'cocobrown_carrinho_timestamp';
    const CART_EXPIRATION_DAYS = 7; // Carrinho expira após 7 dias (era pra estar funcionando isso daqui)
    
    const btnCarrinho = document.querySelector('.btn-carrinho');
    const carrinhoSidebar = document.querySelector('.carrinho-sidebar');
    const carrinhoFechar = document.querySelector('.carrinho-fechar');
    const carrinhoBody = document.querySelector('.carrinho-body');
    const contagemCarrinho = document.querySelector('.contagem-carrinho');
    const carrinhoTotalPreco = document.querySelector('.carrinho-total-preco');
    const btnFinalizar = document.querySelector('.btn-finalizar');
    const btnEsvaziar = document.querySelector('.btn-esvaziar');
    
    // Verifica se o carrinho tá velho demais
    function verificarExpiracaoCarrinho() {
        const timestamp = localStorage.getItem(CART_TIMESTAMP_KEY);
        if (!timestamp) return false; 
        
        const dataCarrinho = parseInt(timestamp);
        const agora = Date.now();
        const diasDecorridos = (agora - dataCarrinho) / (1000 * 60 * 60 * 24);
        
        if (diasDecorridos > CART_EXPIRATION_DAYS) {
            // Carrinho expirou - limpa os dados
            localStorage.removeItem(CART_STORAGE_KEY);
            localStorage.removeItem(CART_TIMESTAMP_KEY);
            console.info(`🛒 Carrinho expirado após ${CART_EXPIRATION_DAYS} dias. Itens removidos.`);
            return true;
        }
        
        return false;
    }
    
    // Valida se os dados do carrinho são válidos
    function validarCarrinho(carrinhoData) {
        if (!Array.isArray(carrinhoData)) return [];
        
        return carrinhoData.filter(item => {
            // Verifica se tem as propriedades
            if (!item || typeof item !== 'object') return false;
            if (!item.id || !item.nome || !item.preco || !item.qtde) return false;
            
            // Verifica se os valores fazem sentido
            if (typeof item.id !== 'number' || item.id <= 0) return false;
            if (typeof item.preco !== 'number' || item.preco <= 0) return false;
            if (typeof item.qtde !== 'number' || item.qtde <= 0 || item.qtde > 99) return false;
            
            return true;
        }).slice(0, 50); // Limita a 50 itens eu acho que isso aqui não vai fazer diferença mas vai que algum arrombado tenta
    }
    
    // Carregar carrinho com verificação de expiração
    let carrinho = [];
    let carrinhoRecuperado = false;
    if (!verificarExpiracaoCarrinho()) {
        const carrinhoSalvo = validarCarrinho(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]'));
        if (carrinhoSalvo.length > 0) {
            carrinho = carrinhoSalvo;
            carrinhoRecuperado = true;
        }
    }

    function salvarCarrinho() {
        // Salva o carrinho e atualiza o timestamp
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carrinho));
        localStorage.setItem(CART_TIMESTAMP_KEY, Date.now().toString());
    }

    function formatarPreco(preco) {
        return `R$ ${preco.toFixed(2).replace('.', ',')}`;
    }

    function atualizarCarrinho() {
        if (!carrinhoBody) return;
        carrinhoBody.innerHTML = '';
        let total = 0;
        let contagemTotal = 0;
        if (carrinho.length === 0) {
            carrinhoBody.innerHTML = `<p style="text-align: center; padding: 2rem; color: var(--cor-texto); opacity: 0.7;">Seu carrinho está vazio</p>`;
        }
        carrinho.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'carrinho-item';
            itemElement.innerHTML = `
                        <img src="${sanitizeURL(item.imagem)}" alt="${sanitizeHTML(item.nome)}">
                        <div class="carrinho-item-info">
                            <h4>${sanitizeHTML(item.nome)}</h4>
                            <p class="carrinho-item-preco">${formatarPreco(sanitizeNumber(item.preco, 0))}</p>
                            <div class="carrinho-item-qtde">
                                <button data-id="${parseInt(item.id)}" class="qtde-btn diminuir">-</button>
                                <span>${parseInt(item.qtde)}</span>
                                <button data-id="${parseInt(item.id)}" class="qtde-btn aumentar">+</button>
                            </div>
                        </div>
                        <button data-id="${parseInt(item.id)}" class="carrinho-remover">&times;</button>`;
            carrinhoBody.appendChild(itemElement);
            total += sanitizeNumber(item.preco, 0) * parseInt(item.qtde || 1);
            contagemTotal += parseInt(item.qtde || 1);
        });
        carrinhoTotalPreco.textContent = formatarPreco(total);
        
        const oldCount = parseInt(contagemCarrinho.textContent) || 0;
        if (oldCount !== contagemTotal) {
            animateCounter(contagemCarrinho, oldCount, contagemTotal, 300);
        }
        
        salvarCarrinho();
        atualizarLinkWhatsApp(total);
    }
    
    function animateCounter(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                element.textContent = end;
                clearInterval(timer);
            } else {
                element.textContent = Math.round(current);
            }
        }, 16);
    }
    
    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');
        
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    function adicionarAoCarrinho(id, eventSource) {
        const produto = produtosDB.find(p => p.id === parseInt(id));
        if (!produto) return;
        const itemExistente = carrinho.find(item => item.id === parseInt(id));
        if (itemExistente) {
            itemExistente.qtde++;
        } else {
            carrinho.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                imagem: produto.imagem,
                qtde: 1
            });
        }
        atualizarCarrinho();
        showToast(`${produto.nome} foi adicionado!`, 'success');
        
        const rect = btnCarrinho.getBoundingClientRect();
        createConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
        
        btnCarrinho.classList.add('shake');
        setTimeout(() => btnCarrinho.classList.remove('shake'), 820);
        if (eventSource) {
            eventSource.textContent = 'Adicionado!';
            eventSource.classList.add('adicionado');
            setTimeout(() => {
                eventSource.textContent = 'Adicionar ao Carrinho';
                eventSource.classList.remove('adicionado');
            }, 2000);
        }
    }

    function atualizarQtde(id, novaQtde) {
        const item = carrinho.find(i => i.id === parseInt(id));
        if (item) {
            // Limita quantidade entre 1 e 99
            novaQtde = Math.max(1, Math.min(99, parseInt(novaQtde) || 1));
            item.qtde = novaQtde;
            if (item.qtde <= 0) {
                carrinho = carrinho.filter(i => i.id !== parseInt(id));
            }
        }
        atualizarCarrinho();
    }

    function atualizarLinkWhatsApp(total) {
        if (!btnFinalizar) return;
        const temItens = carrinho.length > 0;
        btnFinalizar.style.display = temItens ? 'block' : 'none';
        if (btnEsvaziar) {
            btnEsvaziar.style.display = temItens ? 'block' : 'none';
        }
        if (temItens) {
            let mensagem = 'Olá! Gostaria de fazer o seguinte pedido:\n\n' + carrinho.map(item => `*${item.qtde}x* ${item.nome} - ${formatarPreco(item.preco * item.qtde)}`).join('\n') + `\n\n*Total:* ${formatarPreco(total)}`;
            btnFinalizar.href = `https://wa.me/5518996403882?text=${encodeURIComponent(mensagem)}`;
        }
    }

    if (produtosGrid) {
        produtosGrid.addEventListener('click', (e) => {
            const btnAdicionar = e.target.closest('.btn-adicionar');
            if (btnAdicionar && !btnAdicionar.classList.contains('adicionado')) {
                adicionarAoCarrinho(btnAdicionar.dataset.id, btnAdicionar);
            }
        });
    }

    document.getElementById('quick-view-btn').addEventListener('click', function() {
        const id = this.dataset.id;
        if (!id) {
            showToast('Erro: ID do produto não encontrado', 'error');
            return;
        }
        adicionarAoCarrinho(id, this);
    });

    if (carrinhoBody) {
        carrinhoBody.addEventListener('click', (e) => {
            const target = e.target;
            const id = target.dataset.id;
            if (target.classList.contains('aumentar')) {
                const item = carrinho.find(i => i.id === parseInt(id));
                atualizarQtde(id, item.qtde + 1);
            } else if (target.classList.contains('diminuir')) {
                const item = carrinho.find(i => i.id === parseInt(id));
                atualizarQtde(id, item.qtde - 1);
            } else if (target.classList.contains('carrinho-remover')) {
                carrinho = carrinho.filter(i => i.id !== parseInt(id));
                atualizarCarrinho();
            }
        });
    }

    if (btnCarrinho) btnCarrinho.addEventListener('click', () => {
        carrinhoSidebar.classList.add('ativo');
        document.body.classList.add('carrinho-aberto');
        const backdrop = document.getElementById('carrinho-backdrop');
        if (backdrop) backdrop.classList.add('ativo');
        setTimeout(() => {
            if (carrinhoFechar) carrinhoFechar.focus();
        }, 100);
    });
    if (carrinhoFechar) carrinhoFechar.addEventListener('click', () => {
        carrinhoSidebar.classList.remove('ativo');
        document.body.classList.remove('carrinho-aberto');
        const bd = document.getElementById('carrinho-backdrop');
        const menuAberto = document.querySelector('.navegacao')?.classList.contains('ativo');
        if (bd && !menuAberto) bd.classList.remove('ativo');
    });
    
    if (carrinhoSidebar) {
        let touchStartXCart = 0;
        let touchEndXCart = 0;
        
        carrinhoSidebar.addEventListener('touchstart', (e) => {
            touchStartXCart = e.changedTouches[0].screenX;
        }, { passive: true });
        
        carrinhoSidebar.addEventListener('touchend', (e) => {
            touchEndXCart = e.changedTouches[0].screenX;
            handleCartSwipe();
        }, { passive: true });
        
        function handleCartSwipe() {
            if (touchEndXCart > touchStartXCart + 80) {
                carrinhoSidebar.classList.remove('ativo');
                document.body.classList.remove('carrinho-aberto');
                const bd = document.getElementById('carrinho-backdrop');
                const menuAberto = document.querySelector('.navegacao')?.classList.contains('ativo');
                if (bd && !menuAberto) bd.classList.remove('ativo');
            }
        }
    }
    
    // Fecha painéis ao clicar no backdrop
    const backdrop = document.getElementById('carrinho-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            // fecha carrinho, se aberto
            if (carrinhoSidebar && carrinhoSidebar.classList.contains('ativo')) {
                carrinhoSidebar.classList.remove('ativo');
                document.body.classList.remove('carrinho-aberto');
            }
            // fecha menu mobile, se aberto
            if (navegacao && navegacao.classList.contains('ativo')) {
                navegacao.classList.remove('ativo');
                document.body.classList.remove('menu-aberto');
                if (btnMobile) btnMobile.setAttribute('aria-expanded', 'false');
            }
            // remove backdrop apenas se nenhum painel estiver aberto
            const aindaTemCarrinho = carrinhoSidebar?.classList.contains('ativo');
            const aindaTemMenu = navegacao?.classList.contains('ativo');
            if (!aindaTemCarrinho && !aindaTemMenu) backdrop.classList.remove('ativo');
        });
    }
    
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            setTimeout(() => {
                carrinho = [];
                atualizarCarrinho();
            }, 500);
        });
    }

    if (btnEsvaziar) {
        btnEsvaziar.addEventListener('click', () => {
            if (carrinho.length === 0) return;
            
            if (confirm('Tem certeza que deseja esvaziar o carrinho? Todos os itens serão removidos.')) {
                carrinho = [];
                localStorage.removeItem(CART_STORAGE_KEY);
                localStorage.removeItem(CART_TIMESTAMP_KEY);
                atualizarCarrinho();
                showToast('Carrinho esvaziado!');
            }
        });
    }

    const formContato = document.getElementById('form-contato');
    if (formContato) {
        const submitButton = formContato.querySelector('button[type="submit"]');
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success-message';
        
        // ===== FORMULÁRIO DE CONTATO =====
        // Proteção básica - 1 minuto entre envios - isso aqui tá spammando meu email
        const RATE_LIMIT_KEY = 'cocobrown_last_contact_submit';
        const RATE_LIMIT_MS = 60000; // 1 minuto entre envios
        
        // Credenciais do EmailJS - Esse são meus, tem que trocar para o deles depois(SE É QUE VÃO FAZER)
        const EMAILJS_PUBLIC_KEY = 'er_tbzxWFUttJHjHW';
        const EMAILJS_SERVICE_ID = 'service_p18ih8a';
        const EMAILJS_TEMPLATE_ID = 'template_2bb77k8';
        try {
            emailjs.init(EMAILJS_PUBLIC_KEY);
        } catch (e) {
            console.warn("EmailJS não inicializado.");
        }
        formContato.parentNode.insertBefore(successMessage, formContato.nextSibling);

        formContato.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Verifica rate limiting (1 minuto entre envios)
            const lastSubmit = localStorage.getItem(RATE_LIMIT_KEY);
            if (lastSubmit) {
                const timeSinceLastSubmit = Date.now() - parseInt(lastSubmit);
                if (timeSinceLastSubmit < RATE_LIMIT_MS) {
                    const secondsRemaining = Math.ceil((RATE_LIMIT_MS - timeSinceLastSubmit) / 1000);
                    successMessage.textContent = `Por favor, aguarde ${secondsRemaining} segundos antes de enviar outra mensagem.`;
                    successMessage.style.backgroundColor = '#E53935';
                    successMessage.style.display = 'block';
                    setTimeout(() => successMessage.style.display = 'none', 4000);
                    return;
                }
            }
            
            const nome = this.querySelector('[name="nome"]').value.trim();
            const email = this.querySelector('[name="email"]').value.trim();
            const mensagem = this.querySelector('[name="mensagem"]').value.trim();
            
            // Validações de segurança
            if (nome.length < 3 || nome.length > 100) {
                successMessage.textContent = 'O nome deve ter entre 3 e 100 caracteres.';
                successMessage.style.backgroundColor = '#E53935';
                successMessage.style.display = 'block';
                setTimeout(() => successMessage.style.display = 'none', 4000);
                return;
            }
            
            // Validação(sem spammar meu email)
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                successMessage.textContent = 'Por favor, insira um email válido.';
                successMessage.style.backgroundColor = '#E53935';
                successMessage.style.display = 'block';
                setTimeout(() => successMessage.style.display = 'none', 4000);
                return;
            }
            
            if (mensagem.length < 10 || mensagem.length > 1000) {
                successMessage.textContent = 'A mensagem deve ter entre 10 e 1000 caracteres.';
                successMessage.style.backgroundColor = '#E53935';
                successMessage.style.display = 'block';
                setTimeout(() => successMessage.style.display = 'none', 4000);
                return;
            }
            
            const suspiciousPatterns = /<script|javascript:|onerror=|onclick=|<iframe/i;
            if (suspiciousPatterns.test(nome) || suspiciousPatterns.test(mensagem)) {
                successMessage.textContent = 'Conteúdo inválido detectado.';
                successMessage.style.backgroundColor = '#E53935';
                successMessage.style.display = 'block';
                setTimeout(() => successMessage.style.display = 'none', 4000);
                return;
            }
            
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;

            emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, this)
                .then(() => {
                    // Salva timestamp do último envio
                    localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
                    formContato.reset();
                    successMessage.textContent = 'Mensagem enviada com sucesso!';
                    successMessage.style.backgroundColor = 'var(--cor-sucesso)';
                    successMessage.style.display = 'block';
                }, (error) => {
                    console.error('Erro ao enviar:', error);
                    successMessage.textContent = 'Ocorreu um erro ao enviar a mensagem. Tente novamente.';
                    successMessage.style.backgroundColor = '#E53935';
                    successMessage.style.display = 'block';
                })
                .finally(() => {
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                    setTimeout(() => {
                        successMessage.style.display = 'none';
                    }, 6000);
                });
        });
    }

    const formAvaliacao = document.getElementById('form-add-avaliacao');
    if (formAvaliacao) {
        const estrelasInputs = formAvaliacao.querySelectorAll('.estrelas-input i');
        const notaInput = formAvaliacao.querySelector('#avaliacao-nota');
        const avaliacoesGrid = document.getElementById('avaliacoes-grid');
        const STORAGE_KEY = 'cocobrown_avaliacoes';
        const submitButtonAvaliacao = formAvaliacao.querySelector('button[type="submit"]');
        const successMessageAvaliacao = document.createElement('div');
        successMessageAvaliacao.className = 'form-success-message';
        formAvaliacao.parentNode.insertBefore(successMessageAvaliacao, formAvaliacao.nextSibling);

        function carregarAvaliacoes() {
            const avaliacoesSalvas = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            if (avaliacoesGrid) {
                avaliacoesGrid.querySelectorAll('.avaliacao-card.dinamica').forEach(card => card.remove());
                avaliacoesSalvas.forEach(avaliacao => {
                    let estrelasHtml = '';
                    for (let i = 0; i < 5; i++) {
                        if (i < Math.floor(avaliacao.nota)) {
                            estrelasHtml += '<i class="fas fa-star"></i>';
                        } else if (i < avaliacao.nota) {
                            estrelasHtml += '<i class="fas fa-star-half-alt"></i>';
                        } else {
                            estrelasHtml += '<i class="far fa-star"></i>';
                        }
                    }
                    const card = document.createElement('div');
                    card.classList.add('avaliacao-card', 'dinamica');
                    card.innerHTML = `<div class="avaliacao-estrelas">${estrelasHtml}</div><p>"${sanitizeHTML(avaliacao.mensagem)}"</p><h4>- ${sanitizeHTML(avaliacao.nome)}</h4>`;
                    avaliacoesGrid.appendChild(card);
                });
            }
        }

        estrelasInputs.forEach(estrela => {
            estrela.addEventListener('mouseover', function() {
                const valor = this.dataset.value;
                estrelasInputs.forEach((s, i) => s.classList.toggle('hover', i < valor));
            });
            estrela.addEventListener('mouseout', () => estrelasInputs.forEach(s => s.classList.remove('hover')));
            estrela.addEventListener('click', function() {
                const valor = this.dataset.value;
                notaInput.value = valor;
                estrelasInputs.forEach((s, i) => s.classList.toggle('selecionada', i < valor));
            });
        });

        formAvaliacao.addEventListener('submit', function(e) {
            e.preventDefault();
            const nome = this.querySelector('#avaliacao-nome').value.trim();
            const mensagem = this.querySelector('#avaliacao-mensagem').value.trim();
            const nota = parseFloat(notaInput.value);
            
            if (!nome || !mensagem || nota === 0) {
                successMessageAvaliacao.textContent = 'Por favor, preencha todos os campos e selecione uma nota.';
                successMessageAvaliacao.style.backgroundColor = '#E53935';
                successMessageAvaliacao.style.display = 'block';
                setTimeout(() => successMessageAvaliacao.style.display = 'none', 4000);
                return;
            }
            
            if (nome.length < 3) {
                successMessageAvaliacao.textContent = 'O nome deve ter pelo menos 3 caracteres.';
                successMessageAvaliacao.style.backgroundColor = '#E53935';
                successMessageAvaliacao.style.display = 'block';
                setTimeout(() => successMessageAvaliacao.style.display = 'none', 4000);
                return;
            }
            
            if (mensagem.length < 10) {
                successMessageAvaliacao.textContent = 'A mensagem deve ter pelo menos 10 caracteres.';
                successMessageAvaliacao.style.backgroundColor = '#E53935';
                successMessageAvaliacao.style.display = 'block';
                setTimeout(() => successMessageAvaliacao.style.display = 'none', 4000);
                return;
            }
            
            if (mensagem.length > 500) {
                successMessageAvaliacao.textContent = 'A mensagem não pode ter mais de 500 caracteres.';
                successMessageAvaliacao.style.backgroundColor = '#E53935';
                successMessageAvaliacao.style.display = 'block';
                setTimeout(() => successMessageAvaliacao.style.display = 'none', 4000);
                return;
            }
            
            const originalButtonText = submitButtonAvaliacao.textContent;
            submitButtonAvaliacao.textContent = 'Enviando...';
            submitButtonAvaliacao.disabled = true;
            
            setTimeout(() => {
                try {
                    const novaAvaliacao = {
                        nome: sanitizeHTML(nome),
                        mensagem: sanitizeHTML(mensagem),
                        nota: sanitizeNumber(nota, 0),
                        data: new Date().toISOString()
                    };
                    const avaliacoesSalvas = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                    
                    // Deixa 50, mais que isso tá travando pra crl
                    if (avaliacoesSalvas.length >= 50) {
                        avaliacoesSalvas.shift(); 
                    }
                    
                    avaliacoesSalvas.push(novaAvaliacao);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(avaliacoesSalvas));
                    
                    carregarAvaliacoes();
                    this.reset();
                    notaInput.value = 0;
                    estrelasInputs.forEach(s => s.classList.remove('selecionada'));
                    
                    successMessageAvaliacao.textContent = '✓ Avaliação enviada com sucesso! Obrigado pelo seu feedback.';
                    successMessageAvaliacao.style.backgroundColor = 'var(--cor-sucesso)';
                    successMessageAvaliacao.style.display = 'block';
                    
                    setTimeout(() => {
                        successMessageAvaliacao.style.display = 'none';
                    }, 6000);
                } catch (error) {
                    successMessageAvaliacao.textContent = 'Ocorreu um erro ao salvar sua avaliação. Tente novamente.';
                    successMessageAvaliacao.style.backgroundColor = '#E53935';
                    successMessageAvaliacao.style.display = 'block';
                    setTimeout(() => successMessageAvaliacao.style.display = 'none', 4000);
                } finally {
                    submitButtonAvaliacao.textContent = originalButtonText;
                    submitButtonAvaliacao.disabled = false;
                }
            }, 800);
        });

        carregarAvaliacoes();
    }

    atualizarCarrinho();
    
    // Eu acho qeu vou acabar deletando isso depois, ná pratica não vai servir para nada
    if (carrinhoRecuperado) {
        setTimeout(() => {
            const qtdItens = carrinho.reduce((total, item) => total + item.qtde, 0);
            showToast(`🛒 Carrinho recuperado! ${qtdItens} ${qtdItens === 1 ? 'item' : 'itens'} ${qtdItens === 1 ? 'aguardando' : 'aguardando'}`, 'success');
        }, 1000);
    }

    // ===== RESPONSIVIDADE: reset de estados ao voltar para desktop =====
    function resetMobilePanelsIfDesktop() {
        const isDesktop = window.matchMedia('(min-width: 993px)').matches;
        const backdropEl = document.getElementById('carrinho-backdrop');

        if (isDesktop) {
            // Fecha menu mobile se estiver aberto
            if (navegacao && navegacao.classList.contains('ativo')) {
                navegacao.classList.remove('ativo');
                document.body.classList.remove('menu-aberto');
                if (btnMobile) btnMobile.setAttribute('aria-expanded', 'false');
            }

            // Mantém o carrinho se estiver aberto; caso contrário, remove backdrop
            const carrinhoAberto = carrinhoSidebar?.classList.contains('ativo');
            if (backdropEl && !carrinhoAberto) backdropEl.classList.remove('ativo');
        }
    }

    // Debounce simples para evitar excesso de chamadas em resize
    let resizeTimeout;
    function onResizeDebounced() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resetMobilePanelsIfDesktop, 120);
    }

    window.addEventListener('resize', onResizeDebounced, { passive: true });
    window.addEventListener('orientationchange', resetMobilePanelsIfDesktop);
    // Executa uma vez ao carregar
    resetMobilePanelsIfDesktop();
    
    // Adiciona efeito ripple em botões (isso conflita com o carrosel, não toque)
    document.querySelectorAll('button:not(.hero-carousel-btn):not(.btn-carrinho), .btn-principal:not(.hero-carousel-btn)').forEach(btn => {
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.addEventListener('click', createRipple);
    });
});

