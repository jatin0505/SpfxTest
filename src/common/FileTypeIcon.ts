import { findIndex } from '@microsoft/sp-lodash-subset';

export enum ApplicationType {
    Access = 1,
    ASPX,
    Code,
    CSS,
    CSV,
    Excel,
    HTML,
    Image,
    Mail,
    OneNote,
    PDF,
    PowerApps,
    PowerPoint,
    Project,
    Publisher,
    SASS,
    Visio,
    Word
}

export interface IApplicationIcons {

    application: ApplicationType;
    iconName: string;
    imageName: string[];
    extensions: string[];
}

/**
 * Array with all the known applications and their icon and image names
 */
export const ApplicationIconList: IApplicationIcons[] = [
    {
        application: ApplicationType.Access,
        extensions: ['accdb', 'accde', 'accdt', 'accdr', 'mdb'],
        iconName: 'AccessLogo',
        imageName: ['accdb']
    },
    {
        application: ApplicationType.ASPX,
        extensions: ['aspx', 'master'],
        iconName: 'FileASPX',
        imageName: []
    },
    {
        application: ApplicationType.Code,
        extensions: ['js', 'ts', 'cs'],
        iconName: 'FileCode',
        imageName: []
    },
    {
        application: ApplicationType.CSS,
        extensions: ['css'],
        iconName: 'FileCSS',
        imageName: []
    },
    {
        application: ApplicationType.CSV,
        extensions: ['csv'],
        iconName: 'ExcelDocument',
        imageName: ['csv']
    },
    {
        application: ApplicationType.Excel,
        extensions: ['xls', 'xlt', 'xlm', 'xlsx', 'xlsm', 'xltx', 'xltm', 'ods'],
        iconName: 'ExcelDocument',
        imageName: ['xlsx', 'xls', 'xltx', 'ods']
    },
    {
        application: ApplicationType.HTML,
        extensions: ['html'],
        iconName: 'FileHTML',
        imageName: []
    },
    {
        application: ApplicationType.Image,
        extensions: ['jpg', 'jpeg', 'gif', 'png'],
        iconName: 'FileImage',
        imageName: []
    },
    {
        application: ApplicationType.Mail,
        extensions: ['msg'],
        iconName: 'Mail',
        imageName: []
    },
    {
        application: ApplicationType.OneNote,
        extensions: ['one', 'onepkg', 'onetoc'],
        iconName: 'OneNoteLogo',
        imageName: ['one', 'onepkg', 'onetoc']
    },
    {
        application: ApplicationType.PDF,
        extensions: ['pdf'],
        iconName: 'PDF',
        imageName: []
    },
    {
        application: ApplicationType.PowerApps,
        extensions: ['msapp'],
        iconName: 'PowerApps',
        imageName: []
    },
    {
        application: ApplicationType.PowerPoint,
        extensions: ['ppt', 'pot', 'pps', 'pptx', 'pptm', 'potx', 'potm', 'ppam', 'ppsx', 'ppsm', 'sldx', 'sldx'],
        iconName: 'PowerPointDocument',
        imageName: ['odp', 'potx', 'ppsx', 'pptx']
    },
    {
        application: ApplicationType.Project,
        extensions: ['mpp', 'mpt', 'mpx', 'mpd'],
        iconName: 'ProjectLogoInverse',
        imageName: ['mpp', 'mpt']
    },
    {
        application: ApplicationType.Publisher,
        extensions: ['pub'],
        iconName: 'PublisherLogo',
        imageName: ['pub']
    },
    {
        application: ApplicationType.SASS,
        extensions: ['scss', 'sass'],
        iconName: 'FileSass',
        imageName: []
    },
    {
        application: ApplicationType.Visio,
        extensions: ['vsd', 'vss', 'vst', 'vdx', 'vsx', 'vtx', 'vsdx'],
        iconName: 'VisioDocument',
        imageName: ['vsdx', 'vssx', 'vstx']
    },
    {
        application: ApplicationType.Word,
        extensions: ['doc', 'dot', 'docx', 'docm', 'dotx', 'dotm', 'docb', 'odt'],
        iconName: 'WordDocument',
        imageName: ['docx', 'dotx', 'odt']
    }
];

export const images = [
    "accdb",
    "csv",
    "docx",
    "dotx",
    "mpp",
    "mpt",
    "odp",
    "ods",
    "odt",
    "one",
    "onepkg",
    "onetoc",
    "potx",
    "ppsx",
    "pptx",
    "pub",
    "vsdx",
    "vssx",
    "vstx",
    "xls",
    "xlsx",
    "xltx",
    "xsn"
];

export const imageFromExtension = (name: string): string => {
    if (images.indexOf(name) !== -1)
        return `https://static2.sharepointonline.com/files/fabric/assets/brand-icons/document/svg/${name}_48x1.svg`;
    else
        return null;
};

export const iconNameFromExtension = (extension: string) => {
    const index = findIndex(ApplicationIconList, item => { return item.extensions.indexOf(extension.toLowerCase()) !== -1; });

    if (index !== -1) {
        return ApplicationIconList[index].iconName;
    } else {
        return 'OpenFile';
    }
};