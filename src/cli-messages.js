/**
 * Contains user-facing messages, error strings, and help text for the CLI.
 * @module messages
 */
module.exports = {
    /** Display an available structure as a list item. */
    AVAILABLE_STRUCTURE_ITEM: (idx, entry) => `  ${idx}. ${entry}`,
    /** Message displaying available structures. */
    AVAILABLE_STRUCTURES: 'Available Structures:',
    /** Prompt for project path to build. */
    BUILD_PROJECT_PATH: 'Enter project path to build (optional): ',
    /** Prompt for entering project ID to build. */
    BUILD_PROJECT_ID: 'Enter project ID to build: ',
    /** Prompt for project name during creation. */
    CREATE_PROJECT_NAME: '\nProject name: ',
    /** Prompt for output directory during project creation. */
    CREATE_PROJECT_OUTPUT: '\nOutput directory (optional, --output): ',
    /** Error message for missing Ghostscript. */
    ERR_GS_NOT_INSTALLED: 'Error: Ghostscript is not installed or not in your PATH. Please install it to process PDF files.',
    /** Error message for missing GraphicsMagick. */
    ERR_GM_NOT_INSTALLED: 'Error: GraphicsMagick is not installed or not in your PATH. Please install it to use this app.',
    /** Error message for missing name or structure. */
    ERR_MISSING_NAME_STRUCT: 'Missing --name or --struct',
    /** Error message for missing project ID. */
    ERR_MISSING_ID: 'Missing --id',
    /** Error message for missing path or ID for build command. */
    ERR_MISSING_PATH_OR_ID: 'Missing --id or --path for build command.',
    /** Error message for project not found. */
    ERR_PROJECT_NOT_FOUND: 'Project not found.',
    /** Error message for specifying both ID and path or neither. */
    ERR_BUILD_ID_PATH_EXCLUSIVE: 'Please specify only one of --id or --path for build.',
    /** Error message for build project from object failure. */
    ERR_BUILD_PROJECT_FROM_OBJECT: (err) => `Error building project: ${err}`,
    /** Error message for missing path in set-workspace command. */
    ERR_SET_WORKSPACE_MISSING_PATH: 'Error: You must provide a path for set-workspace.',
    /** Help text displaying usage and options. */
    HELP_TEXT: [
        '',
        'Usage:',
        '',
        '  Project Listing:',
        '    node main.js list',
        '        List all projects in the workspace.',
        '',
        '  Project Creation:',
        '    node main.js create --name <projectName> --struct <structNo>',
        '        Create a new project in the default workspace.',
        '    node main.js create --name <projectName> --struct <structNo> --output <dir>',
        '        Create a new project in the specified output directory.',
        '',
        '  Project Building:',
        '    node main.js build --id <projectId>',
        '        Build a project from the workspace by its ID.',
        '    node main.js build --path <projectDir>',
        '        Build a project directly from the given directory.',
        '',
        '  Workspace Management:',
        '    node main.js set-workspace <path>',
        '        Set and persist the default workspace path.',
        '    node main.js reset-workspace',
        '        Reset workspace to default.',
        '',
        'Options:',
        '  --output <dir>           Output directory for new project (create).',
        '  --path <dir>             Project directory (for build only).',
        '  --id <id>                Project ID (for build from workspace).',
        '  --name <name>            Project name (for create).',
        '  --struct <number>        Structure number (for create).',
        '',
        'Notes:',
        '  - For build, you must specify only one of --id or --path.',
        '  - For create, you may specify --output, or neither.',
        ''
    ].join('\n'),
    /** Message for invalid option. */
    INVALID_OPTION: 'Invalid option.',
    /** Detail for invalid option. */
    INVALID_OPTION_DETAIL: '[!] Invalid option. Enter 1, 2, 3, 4, 5, or 0.',
    /** Error message for invalid structure number. */
    INVALID_STRUCTURE_NUMBER: '[!] Invalid structure number. Please select a valid option.',
    /** Title for the action menu. */
    ACTION_MENU_TITLE: '\nAction Menu',
    /** Action menu option for building a project. */
    ACTION_MENU_BUILD_PROJECT: '  3. Build Project',
    /** Action menu option for changing workspace. */
    ACTION_MENU_CHANGE_WORKSPACE: '  4. Change Workspace',
    /** Action menu option for creating a project. */
    ACTION_MENU_CREATE_PROJECT: '  2. Create Project',
    /** Action menu option for exiting. */
    ACTION_MENU_EXIT: '  0. Exit',
    /** Action menu option for listing projects. */
    ACTION_MENU_LIST_PROJECTS: '  1. List Projects',
    /** Minimal action menu options. */
    ACTION_MENU_MINIMAL: '\n[1] List, [2] Create, [3] Build, [4] Workspace, [5] Set Workspace, [0] Exit',
    /** Action menu option for setting default workspace. */
    ACTION_MENU_SET_WORKSPACE: '  5. Set Default Workspace',
    /** Prompt to select an action. */
    ACTION_MENU_SELECT: 'Select an action: ',
    /** Message when no projects are found. */
    PROJECT_LIST_EMPTY: 'No projects found.',
    /** Title for the project list. */
    PROJECT_LIST_TITLE: '\nProject List:',
    /** Status message for completion. */
    STATUS_DONE: 'Done.',
    /** Status message for error building project. */
    STATUS_ERROR_BUILDING_PROJECT: (err) => `Error building project: ${err}`,
    /** Status message for error creating project. */
    STATUS_ERROR_CREATING_PROJECT: (err) => `Error creating project: ${err}`,
    /** Status message for error loading projects. */
    STATUS_ERROR_LOADING_PROJECTS: (err) => `Error loading projects: ${err}`,
    /** Status message for building a project. */
    STATUS_BUILDING_PROJECT: (name) => `Building project: ${name}`,
    /** Status message for building a project from a path. */
    STATUS_BUILDING_PROJECT_FROM_PATH: (path) => `Building project from path: ${path}`,
    /** Status message for creating a project. */
    STATUS_CREATING_PROJECT: (name) => `Creating project: ${name}`,
    /** Status message for project built. */
    STATUS_PROJECT_BUILT: 'Project built successfully.',
    /** Status message for project creation. */
    STATUS_PROJECT_CREATED: 'Project created successfully.',
    /** Status message indicating where the project was created. */
    STATUS_PROJECT_CREATED_AT: (path) => `Project created at: ${path}`,
    /** Status message for default workspace. */
    STATUS_DEFAULT_WORKSPACE: (ws) => `Default workspace set to: ${ws}`,
    /** Status message for loading projects. */
    STATUS_LOADING_PROJECTS: 'Loading projects...',
    /** Status message for workspace reset. */
    STATUS_WORKSPACE_RESET: (ws) => `Workspace reset to default: ${ws}`,
    /** Status message for workspace set. */
    STATUS_WORKSPACE_SET: (ws) => `Workspace set to: ${ws}`,
    /** Status message for workspace updated. */
    STATUS_WORKSPACE_UPDATED: (ws) => `Default workspace updated to: ${ws}`,
    /** Prompt to enter a custom path. */
    ENTER_CUSTOM_PATH: 'Enter custom path: ',
    /** Prompt to use the current workspace. */
    USE_CURRENT_WORKSPACE: 'Use current workspace? (Y/n): ',
    /** Prompt to select a structure number. */
    SELECT_STRUCTURE_NUMBER: 'Select structure number: ',
};
