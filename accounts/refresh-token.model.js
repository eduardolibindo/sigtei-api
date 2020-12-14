// const { DataTypes } = require('sequelize');

// module.exports = RefreshToken;

// function RefreshToken(sequelize) {
//     const attributes = {
//         token: { type: DataTypes.STRING },
//         expires: { type: DataTypes.DATE },
//         created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
//         createdByIp: { type: DataTypes.STRING },
//         revoked: { type: DataTypes.DATE },
//         revokedByIp: { type: DataTypes.STRING },
//         replacedByToken: { type: DataTypes.STRING },
//         isExpired: {
//             type: DataTypes.VIRTUAL,
//             get() { return Date.now() >= this.expires; }
//         },
//         isActive: {
//             type: DataTypes.VIRTUAL,
//             get() { return !this.revoked && !this.isExpired; }
//         }
//     };

//     const options = {
//         // desativa os campos de carimbo de data/hora padrão (createdAt e updatedAt)
//         timestamps: false
//     };

//     return sequelize.define('RefreshToken', attributes, options);
// }

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

    return sequelize.define('RefreshToken', {
        token: { type: DataTypes.STRING },
        expires: { type: DataTypes.DATE },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdByIp: { type: DataTypes.STRING },
        revoked: { type: DataTypes.DATE },
        revokedByIp: { type: DataTypes.STRING },
        replacedByToken: { type: DataTypes.STRING },
        isExpired: { type: DataTypes.VIRTUAL, get() { return Date.now() >= this.expires; } },
        isActive: { type: DataTypes.VIRTUAL, get() { return !this.revoked && !this.isExpired; } }
    }, {
        // desativa os campos de carimbo de data/hora padrão (createdAt e updatedAt)
        timestamps: false
    });

}