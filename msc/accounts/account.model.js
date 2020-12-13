const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Account', {
        email: { type: DataTypes.STRING, allowNull: false },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        rg: { type: DataTypes.STRING, allowNull: false },
        institution: { type: DataTypes.STRING, allowNull: false },
        course: { type: DataTypes.STRING, allowNull: false },
        phone: { type: DataTypes.STRING, allowNull: false },
        address: { type: DataTypes.STRING, allowNull: false },
        acceptTerms: { type: DataTypes.BOOLEAN },
        role: { type: DataTypes.STRING, allowNull: false },
        verificationToken: { type: DataTypes.STRING },
        verified: { type: DataTypes.DATE },
        resetToken: { type: DataTypes.STRING },
        resetTokenExpires: { type: DataTypes.DATE },
        passwordReset: { type: DataTypes.DATE },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
        isVerified: { type: DataTypes.VIRTUAL, get() { return !!(this.verified || this.passwordReset); }},
         // desativa os campos de carimbo de data/hora padrão (createdAt e updatedAt)
        // timestamps: false,

        // defaultScope: {
        //     // excluir hash de senha por padrão
        //     exclude: ['passwordHash']
        // },
        
        // scopes: {
        //     // inclui hash com este escopo
        //     // withHash: { attributes: {}, },
        //     include: ['withHash']
        // }        


    })
}


// const { DataTypes } = require('sequelize');

// module.exports = account;

// function account(sequelize) {
//     const attributes = {
//         email: { type: DataTypes.STRING, allowNull: false },
//         passwordHash: { type: DataTypes.STRING, allowNull: false },
//         title: { type: DataTypes.STRING, allowNull: false },
//         firstName: { type: DataTypes.STRING, allowNull: false },
//         lastName: { type: DataTypes.STRING, allowNull: false },
//         rg: { type: DataTypes.STRING, allowNull: false },
//         institution: { type: DataTypes.STRING, allowNull: false },
//         course: { type: DataTypes.STRING, allowNull: false },
//         phone: { type: DataTypes.STRING, allowNull: false },
//         address: { type: DataTypes.STRING, allowNull: false },
//         acceptTerms: { type: DataTypes.BOOLEAN },
//         role: { type: DataTypes.STRING, allowNull: false },
//         verificationToken: { type: DataTypes.STRING },
//         verified: { type: DataTypes.DATE },
//         resetToken: { type: DataTypes.STRING },
//         resetTokenExpires: { type: DataTypes.DATE },
//         passwordReset: { type: DataTypes.DATE },
//         created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
//         updated: { type: DataTypes.DATE },
//         isVerified: {
//             type: DataTypes.VIRTUAL,
//             get() { return !!(this.verified || this.passwordReset); }
//         }
//     };

//     const options = {
//         // desativa os campos de carimbo de data/hora padrão (createdAt e updatedAt)
//         timestamps: false, 
//         defaultScope: {
//             // excluir hash de senha por padrão
//             attributes: { exclude: ['passwordHash'] }
//         },
//         scopes: {
//             // inclui hash com este escopo
//             withHash: { attributes: {}, }
//         }        
//     };

//     return sequelize.define('account', attributes, options);
// }