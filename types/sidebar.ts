export interface GeneralData {
    tasks: number;
    invitations: number;
  }
  
  export interface ProjectsData {
    projects: number;
  }
  
  export interface SettingsData {
    notification: number;
  }
  
  export interface SidebarDataResponse {
    general: GeneralData;
    projects: ProjectsData;
    settings: SettingsData;
  }
  
  /**
   * API Response wrapper for sidebar endpoint
   */
  export interface SidebarApiResponse {
    success: boolean;
    message: string;
    data: SidebarDataResponse;
  }
  
  