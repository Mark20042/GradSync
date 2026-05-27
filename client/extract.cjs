const fs = require('fs');
const path = require('path');

const adminUsersPath = 'D:\\SipaCareer\\client\\src\\pages\\Admin\\AdminUsers.jsx';
const componentsDir = 'D:\\SipaCareer\\client\\src\\pages\\Admin\\components\\UserForm';

if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
}

const content = fs.readFileSync(adminUsersPath, 'utf8');
const lines = content.split('\n');

// Find boundaries
let basicStart = -1, imageStart = -1, gradStart = -1, empStart = -1, endStart = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Basic Information') && lines[i].includes('<h3')) basicStart = i - 1; // get the <div className="space-y-4"> before it
    if (lines[i].includes('{/* Profile Image Upload */}')) imageStart = i;
    if (lines[i].includes('{/* Graduate Specific */}')) gradStart = i;
    if (lines[i].includes('{/* Employer Specific */}')) empStart = i;
    if (lines[i].includes('<div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">')) endStart = i;
}

const basicCode = lines.slice(basicStart, imageStart).join('\n');
const imageCode = lines.slice(imageStart, gradStart).join('\n');
const gradCode = lines.slice(gradStart, empStart).join('\n');
const empCode = lines.slice(empStart, endStart).join('\n');

const makeComponent = (name, propsStr, jsxCode, imports = '') => `
import React from 'react';
import { Eye, EyeOff, Upload, File, Loader } from 'lucide-react';
${imports}

const ${name} = ({ ${propsStr} }) => {
    return (
        <>
${jsxCode}
        </>
    );
};

export default ${name};
`;

const basicProps = 'editingUser, setEditingUser, showPassword, setShowPassword';
const imageProps = 'editingUser, setEditingUser, imageUploading, handleImageUpload';
const gradProps = 'editingUser, setEditingUser, degrees, degreeSearchTerm, setDegreeSearchTerm, showDegreeDropdown, setShowDegreeDropdown, degreeDropdownRef';
const empProps = 'editingUser, setEditingUser';

fs.writeFileSync(path.join(componentsDir, 'UserBasicInfo.jsx'), makeComponent('UserBasicInfo', basicProps, basicCode));
fs.writeFileSync(path.join(componentsDir, 'UserProfileImage.jsx'), makeComponent('UserProfileImage', imageProps, imageCode));
fs.writeFileSync(path.join(componentsDir, 'UserGraduateInfo.jsx'), makeComponent('UserGraduateInfo', gradProps, gradCode));
fs.writeFileSync(path.join(componentsDir, 'UserEmployerInfo.jsx'), makeComponent('UserEmployerInfo', empProps, empCode));

// Now replace in AdminUsers.jsx
const topPart = lines.slice(0, basicStart).join('\n');
const bottomPart = lines.slice(endStart).join('\n');

const newAdminUsers = topPart + `
                        <UserBasicInfo editingUser={editingUser} setEditingUser={setEditingUser} showPassword={showPassword} setShowPassword={setShowPassword} />
                        <UserProfileImage editingUser={editingUser} setEditingUser={setEditingUser} imageUploading={imageUploading} handleImageUpload={handleImageUpload} />
                        <UserGraduateInfo 
                            editingUser={editingUser} 
                            setEditingUser={setEditingUser} 
                            degrees={degrees} 
                            degreeSearchTerm={degreeSearchTerm} 
                            setDegreeSearchTerm={setDegreeSearchTerm} 
                            showDegreeDropdown={showDegreeDropdown} 
                            setShowDegreeDropdown={setShowDegreeDropdown} 
                            degreeDropdownRef={degreeDropdownRef} 
                        />
                        <UserEmployerInfo editingUser={editingUser} setEditingUser={setEditingUser} />
` + bottomPart;

// Insert imports at the top
let finalAdminUsers = newAdminUsers.replace(
    'import AdminModal from "./components/AdminModal";',
    `import AdminModal from "./components/AdminModal";
import UserBasicInfo from "./components/UserForm/UserBasicInfo";
import UserProfileImage from "./components/UserForm/UserProfileImage";
import UserGraduateInfo from "./components/UserForm/UserGraduateInfo";
import UserEmployerInfo from "./components/UserForm/UserEmployerInfo";`
);

// fix max-w-lg to max-w-4xl
finalAdminUsers = finalAdminUsers.replace(
    'title={editingUser?._id ? "Edit User" : "Add User"}',
    'title={editingUser?._id ? "Edit User" : "Add User"}\n                maxWidth="max-w-4xl"'
);

fs.writeFileSync(adminUsersPath, finalAdminUsers);
console.log('Successfully extracted components and updated AdminUsers.jsx');
