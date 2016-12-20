; �ű��� Inno Setup �ű��� ���ɣ�
; �йش��� Inno Setup �ű��ļ�����ϸ��������İ����ĵ���

#define MyAppName "���¼���һ�廯ƽ̨"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "�������οƽ�߿Ƽ��ɷ����޹�˾"
#define MyAppURL "http://www.hisign.com.cn"
#define MyAppExeName "HOne.exe"
#define ExeOutputDir "C:\"
#define AppDistDir "C:\tmp"
[Setup]
; ע: AppId��ֵΪ������ʶ��Ӧ�ó���
; ��ҪΪ������װ����ʹ����ͬ��AppIdֵ��
; (�����µ�GUID����� ����|��IDE������GUID��)
AppId={{FBBCEA57-F3E7-4999-9DAD-08016DBC3B5B}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={pf}\HOne
DefaultGroupName={#MyAppName}
OutputDir={#ExeOutputDir}
OutputBaseFilename=HOneSetup
SetupIconFile={#AppDistDir}\favicon.ico
Compression=lzma
SolidCompression=yes

[Languages]
Name: "chinesesimp"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkablealone

[Files]
Source: "{#AppDistDir}\HOne.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#AppDistDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; ע��: ��Ҫ���κι���ϵͳ�ļ���ʹ�á�Flags: ignoreversion��

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}";IconFilename: "{app}\favicon.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Registry] 
;Root: HKLM; Subkey: "SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "HOneRun"; ValueData: "{app}\{#MyAppExeName}" ;Flags: uninsdeletekey 
Root: HKLM; Subkey: "SOFTWARE\HOne\Install"; ValueType: string; ValueName: "path"; ValueData: "{app}\{#MyAppExeName}" ;Flags: uninsdeletekey 
[code]


function IsAppRunning(const FileName : string): Boolean;
var
    FSWbemLocator: Variant;
    FWMIService   : Variant;
    FWbemObjectSet: Variant;
begin
    Result := false;
    FSWbemLocator := CreateOleObject('WBEMScripting.SWBEMLocator');
    FWMIService := FSWbemLocator.ConnectServer('', 'root\CIMV2', '', '');
    FWbemObjectSet := FWMIService.ExecQuery(Format('SELECT Name FROM Win32_Process Where Name="%s"',[FileName]));
    Result := (FWbemObjectSet.Count > 0);
    FWbemObjectSet := Unassigned;
    FWMIService := Unassigned;
    FSWbemLocator := Unassigned;
end;

function InitializeUninstall():Boolean;
var ifRunning:boolean;
var appWnd: HWND;
var ifStop:boolean;
begin
   ifRunning := IsAppRunning('HOne.exe');
   if ifRunning then
        ifStop := MsgBox('��⵽�ͻ����������У�ж��ǰ���˳������Ƿ������', mbConfirmation, MB_YESNO) = idYes;

        if ifStop then

        appWnd := FindWindowByClassName('Chrome_WidgetWin_0');
        if (appWnd <> 0) then
         begin
            PostMessage(appWnd, 18, 0, 0);       // quit
             Result := true;
         end;

        if ifStop = false then
           Result := false;

   if ifRunning = false then
      Result := true;
end;

function InitializeSetup(): Boolean;
var ifRunning:boolean;
var appWnd: HWND;
var ifStop:boolean;
begin
 ifRunning := IsAppRunning('HOne.exe');
  if ifRunning then
     ifStop := MsgBox('��⵽�ͻ����������У���װǰ���˳������Ƿ������', mbConfirmation, MB_YESNO) = idYes;
     if ifStop then
     appWnd := FindWindowByClassName('Chrome_WidgetWin_0');
        if (appWnd <> 0) then
         begin
            PostMessage(appWnd, 18, 0, 0);       // quit
             Result := true;
         end;
  if ifStop = false then
         Result := false;

  if ifRunning = false then
          Result := true;


end;