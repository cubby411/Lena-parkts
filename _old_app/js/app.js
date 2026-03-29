document.addEventListener('DOMContentLoaded', () => {
    // ---- Navigation & Views ----
    const btnGuides = document.getElementById('btn-guides');
    const btnSimulator = document.getElementById('btn-simulator');
    const viewGuides = document.getElementById('view-guides');
    const viewSimulator = document.getElementById('view-simulator');
    
    function switchView(viewId) {
        // Reset active state
        btnGuides.classList.remove('active');
        btnSimulator.classList.remove('active');
        viewGuides.style.display = 'none';
        viewGuides.classList.remove('active');
        viewSimulator.style.display = 'none';
        viewSimulator.classList.remove('active');
        
        // Set new active view
        if (viewId === 'guides') {
            btnGuides.classList.add('active');
            viewGuides.style.display = 'block';
            setTimeout(() => viewGuides.classList.add('active'), 10);
        } else {
            btnSimulator.classList.add('active');
            viewSimulator.style.display = 'block';
            setTimeout(() => viewSimulator.classList.add('active'), 10);
        }
    }
    
    btnGuides.addEventListener('click', () => switchView('guides'));
    btnSimulator.addEventListener('click', () => switchView('simulator'));
    
    // ---- Guides Detail Logic ----
    const viewGuideDetail = document.getElementById('view-guide-detail');
    const guideDetailTitle = document.getElementById('guide-detail-title');
    const guideStepText = document.getElementById('tutorial-step-text');
    const guideStepIndicator = document.getElementById('tutorial-step-indicator');
    const btnBackGuides = document.getElementById('btn-back-guides');
    const btnNext = document.getElementById('btn-tutorial-next');
    const btnPrev = document.getElementById('btn-tutorial-prev');
    const cards = document.querySelectorAll('.card button');
    
    let activeGuide = null;
    let currentStep = 0;
    let totalSteps = 0;

    cards[0].addEventListener('click', () => openGuideDetail('parallel'));
    cards[1].addEventListener('click', () => openGuideDetail('perpendicular'));
    if (cards[2]) cards[2].addEventListener('click', () => openGuideDetail('turn'));
    
    btnBackGuides.addEventListener('click', () => {
        viewGuideDetail.style.display = 'none';
        viewGuides.style.display = 'block';
    });

    function openGuideDetail(type) {
        activeGuide = type;
        currentStep = 0;
        viewGuides.style.display = 'none';
        viewGuideDetail.style.display = 'block';
        updateGuideContent();
    }
    
    function updateGuideContent() {
        if (!activeGuide) return;
        const langDict = window.i18nDict[window.currentLang];
        guideDetailTitle.textContent = langDict[`guide-${activeGuide}`];
        
        const steps = langDict[`steps-${activeGuide}`];
        totalSteps = steps.length;
        
        guideStepIndicator.textContent = `${langDict['step-label'] || 'Schritt'} ${currentStep + 1}/${totalSteps}`;
        guideStepText.textContent = steps[currentStep];
        
        // Update Buttons
        btnPrev.disabled = currentStep === 0;
        btnNext.disabled = currentStep === totalSteps - 1;
        btnPrev.style.opacity = currentStep === 0 ? '0.5' : '1';
        btnNext.style.opacity = currentStep === totalSteps - 1 ? '0.5' : '1';
        
        // Push update to Tutorial Canvas Render
        if (window.updateTutorialCanvas) {
            window.updateTutorialCanvas(activeGuide, currentStep);
        }
    }

    btnNext.addEventListener('click', () => {
        if (currentStep < totalSteps - 1) {
            currentStep++;
            updateGuideContent();
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateGuideContent();
        }
    });
    
    // ---- Language Switching ----
    document.getElementById('lang-de').addEventListener('click', () => { window.setLanguage('de'); updateGuideContent(); });
    document.getElementById('lang-ru').addEventListener('click', () => { window.setLanguage('ru'); updateGuideContent(); });
    
    // Initialize default language
    window.setLanguage('de');
});
