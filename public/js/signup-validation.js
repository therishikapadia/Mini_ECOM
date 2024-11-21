document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signup-form');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    const requirements = {
        length: document.getElementById('length-req'),
        uppercase: document.getElementById('uppercase-req'),
        lowercase: document.getElementById('lowercase-req'),
        number: document.getElementById('number-req'),
        special: document.getElementById('special-req'),
        match: document.getElementById('match-req')
    };

    function validatePassword() {
        const pwd = password.value;
        const confirm = confirmPassword.value;

        // Length requirement
        requirements.length.classList.toggle('valid', pwd.length >= 8);
        
        // Uppercase requirement
        requirements.uppercase.classList.toggle('valid', /[A-Z]/.test(pwd));
        
        // Lowercase requirement
        requirements.lowercase.classList.toggle('valid', /[a-z]/.test(pwd));
        
        // Number requirement
        requirements.number.classList.toggle('valid', /[0-9]/.test(pwd));
        
        // Special character requirement
        requirements.special.classList.toggle('valid', /[!@#$%^&*]/.test(pwd));
        
        // Password match requirement
        requirements.match.classList.toggle('valid', pwd === confirm && pwd !== '');
    }

    password.addEventListener('input', validatePassword);
    confirmPassword.addEventListener('input', validatePassword);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check if all requirements are met
        const allRequirementsMet = Object.values(requirements)
            .every(req => req.classList.contains('valid'));

        if (allRequirementsMet) {
            this.submit();
        } else {
            alert('Please meet all password requirements before submitting.');
        }
    });
});
