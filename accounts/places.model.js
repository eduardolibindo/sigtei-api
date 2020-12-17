// const { DataTypes } = require('sequelize');

// module.exports = Places;

// function Places(sequelize) {
//     const attributes = {
//         title: { type: DataTypes.STRING, allowNull: false },
//         place: { type: DataTypes.STRING, allowNull: false },
//         street: { type: DataTypes.STRING, allowNull: false },
//         district: { type: DataTypes.STRING, allowNull: false },
//         city: { type: DataTypes.STRING, allowNull: false },
//         state: { type: DataTypes.STRING, allowNull: false },
//         verified: { type: DataTypes.DATE },
//         created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
//         updated: { type: DataTypes.DATE },
//         isVerified: {
//             type: DataTypes.VIRTUAL,
//             get() { return !!(this.verified); }
//         }

//     };

//     const options = {
//         // desativa os campos de carimbo de data/hora padrão (createdAt e updatedAt)
//         timestamps: false
//     };

//     return sequelize.define('Places', attributes, options);
// }

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

    return sequelize.define('Places', {
        type: { type: DataTypes.STRING, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        place: { type: DataTypes.STRING, allowNull: false },
        street: { type: DataTypes.STRING, allowNull: false },
        district: { type: DataTypes.STRING, allowNull: false },
        city: { type: DataTypes.STRING, allowNull: false },
        state: { type: DataTypes.STRING, allowNull: false },
        verified: { type: DataTypes.DATE },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
        isVerified: { type: DataTypes.VIRTUAL, get() { return !!(this.verified); } }
    }, {
        // desativa os campos de carimbo de data/hora padrão (createdAt e updatedAt)
        timestamps: false
    });

}