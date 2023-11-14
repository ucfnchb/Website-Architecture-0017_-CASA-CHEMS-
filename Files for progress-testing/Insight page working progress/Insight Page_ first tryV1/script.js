function highlightTreeBenefits() {
    const treeBenefits = document.querySelectorAll('.left-box ul li');
    treeBenefits.forEach(benefit => {
      benefit.classList.add('highlight');
    });
  }
  function removeHighlight() {
    const treeBenefits = document.querySelectorAll('.left-box ul li');
    treeBenefits.forEach(benefit => {
      benefit.classList.remove('highlight');
    });
  }
  