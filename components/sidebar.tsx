"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Sparkles,
  Search,
  FileText,
  CreditCard,
  User,
  MessageSquare,
  LogOut,
  GraduationCap,
  Settings,
  HelpCircle,
  BarChart2,
  BookOpen,
  Bookmark,
  History,
  Palette,
  Users,
  Cpu,
  Crown,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
// Import the trial management utilities at the top of the file
import { isTrialActive, getRemainingTrialDays } from "@/lib/trial-management"

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
  premium?: boolean;
  badge?: string;
  external?: boolean;
}

interface SidebarSection {
  title: string | null;
  items: SidebarItem[];
}

const sidebarItems: SidebarSection[] = [
	{
		title: null,
		items: [
			{
				title: "Dashboard",
				href: "/dashboard",
				icon: LayoutDashboard,
			},
		],
	},
	{
		title: "Admin",
		items: [
			{
				title: "Dashboard",
				href: "/admin/dashboard",
				icon: Shield,
			},
		],
	},
	{
		title: "Features",
		items: [
			{
				title: "Paraphraser",
				href: "/paraphraser",
				icon: Sparkles,
			},
			{
				title: "AI Checker",
				href: "/ai-checker",
				icon: Search,
			},
			{
				title: "Assignment Writer",
				href: "/assignment-writer",
				icon: GraduationCap,
				premium: true,
			},
			{
				title: "Editor",
				href: "/editor",
				icon: FileText,
				premium: true,
			},
			{
				title: "AI Models",
				href: "/models",
				icon: Cpu,
			},
		],
	},
	{
		title: "Library",
		items: [
			{
				title: "Saved Documents",
				href: "/documents",
				icon: Bookmark,
				badge: "12",
			},
			{
				title: "History",
				href: "/history",
				icon: History,
			},
			{
				title: "Templates",
				href: "/templates",
				icon: BookOpen,
			},
		],
	},
	{
		title: "Analytics",
		items: [
			{
				title: "Usage Stats",
				href: "/stats",
				icon: BarChart2,
			},
		],
	},
	{
		title: "Settings",
		items: [
			{
				title: "Pricing",
				href: "/pricing",
				icon: CreditCard,
			},
			{
				title: "Premium Features",
				href: "/premium-features",
				icon: Crown,
			},
			{
				title: "Account",
				href: "/account",
				icon: User,
			},
			{
				title: "Theme",
				href: "/preferences/theme",
				icon: Palette,
			},
			{
				title: "Preferences",
				href: "/preferences",
				icon: Settings,
			},
		],
	},
	{
		title: "Support",
		items: [
			{
				title: "Help Center",
				href: "/help",
				icon: HelpCircle,
			},
			{
				title: "Discord",
				href: "https://discord.gg",
				icon: MessageSquare,
				external: true,
			},
		],
	},
]

export default function Sidebar() {
	const pathname = usePathname()
	const [collapsed, setCollapsed] = useState(false)
	const { logout, user } = useAuth()

	// Convert User to PublicUser format for trial functions
	const publicUser = user ? {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		plan: user.plan === 'premium' ? 'pro' : user.plan as 'free' | 'pro' | 'enterprise',
		createdAt: user.createdAt?.toString() || new Date().toISOString(),
	} : null

	const isOnTrial = isTrialActive(publicUser)
	const remainingTrialDays = getRemainingTrialDays(publicUser)

	const handleLogout = () => {
		logout()
	}

	const isPremium = user?.plan === "premium"

	return (
		<div
			className={cn(
				"border-r border-border bg-card flex flex-col h-full transition-all duration-300",
				collapsed ? "w-16" : "w-64",
			)}
		>
			<div className={cn("p-4 flex items-center gap-2 border-b border-border", collapsed ? "justify-center" : "px-6")}>
				<Link href="/" className={cn("flex items-center gap-2 font-bold text-xl", collapsed && "justify-center")}>
					<Sparkles className="h-5 w-5 text-primary" />
					{!collapsed && <span>TrueTextAI</span>}
				</Link>

				{!collapsed && (
					<Button variant="ghost" size="sm" className="ml-auto" onClick={() => setCollapsed(true)}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="m15 18-6-6 6-6" />
						</svg>
					</Button>
				)}

				{collapsed && (
					<Button
						variant="ghost"
						size="sm"
						className="absolute right-0 top-4 -mr-3 bg-background border border-border rounded-full p-1"
						onClick={() => setCollapsed(false)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="m9 18 6-6-6-6" />
						</svg>
					</Button>
				)}
			</div>

			<ScrollArea className="flex-1 overflow-auto py-2">
				<TooltipProvider delayDuration={0}>
					{/* Trial Status Display */}
					{isOnTrial && (
						<div className={cn("py-2", collapsed ? "px-2" : "px-3")}>
							{!collapsed && (
								<div className="mb-2 px-4 bg-amber-100 dark:bg-amber-900/30 rounded-md p-2">
									<div className="flex items-center gap-2">
										<Crown className="h-4 w-4 text-amber-500" />
										<span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
											Premium Trial: {remainingTrialDays}d left
										</span>
									</div>
								</div>
							)}
							{collapsed && (
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex justify-center mb-2">
											<div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-1">
												<Crown className="h-4 w-4 text-amber-500" />
											</div>
										</div>
									</TooltipTrigger>
									<TooltipContent side="right">Premium Trial: {remainingTrialDays} days left</TooltipContent>
								</Tooltip>
							)}
						</div>
					)}

					{sidebarItems.map(
						(group, i) =>
							// Only show admin section if user is admin
							(group.title !== "Admin" || user?.role === "admin") && (
								<div key={i} className={cn("py-2", collapsed ? "px-2" : "px-3")}>
									{group.title && !collapsed && (
										<h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">{group.title}</h3>
									)}
									<div className="space-y-1">
										{group.items.map((item, j) =>
											collapsed ? (
												<Tooltip key={j}>
													<TooltipTrigger asChild>
														<Link
															href={item.href}
															target={item.external ? "_blank" : undefined}
															rel={item.external ? "noopener noreferrer" : undefined}
															className={cn(
																"flex justify-center items-center rounded-lg p-2 text-sm font-medium transition-colors",
																pathname === item.href
																	? "bg-primary/10 text-primary"
																	: "text-muted-foreground hover:bg-muted hover:text-foreground",
															)}
														>
															<div className="relative">
																<item.icon className="h-5 w-5" />
																{item.premium && <Crown className="absolute -top-2 -right-2 h-3 w-3 text-amber-500" />}
															</div>
															{"badge" in item && (
																<span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
															)}
														</Link>
													</TooltipTrigger>
													<TooltipContent side="right">
														{item.title} {item.premium && "(Premium)"}
													</TooltipContent>
												</Tooltip>
											) : (
												<Link
													key={j}
													href={item.href}
													target={item.external ? "_blank" : undefined}
													rel={item.external ? "noopener noreferrer" : undefined}
													className={cn(
														"flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
														pathname === item.href
															? "bg-primary/10 text-primary"
															: "text-muted-foreground hover:bg-muted hover:text-foreground",
													)}
												>
													<item.icon className="h-5 w-5" />
													<span>{item.title}</span>
													{item.premium && <Crown className="h-3.5 w-3.5 text-amber-500 ml-1" />}
													{"badge" in item && (
														<span className="ml-auto bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
															{item.badge}
														</span>
													)}
												</Link>
											),
										)}
									</div>
								</div>
							),
					)}
				</TooltipProvider>
			</ScrollArea>

			<div className={cn("p-4 mt-auto border-t border-border", collapsed ? "flex justify-center" : "")}>
				<button
					onClick={handleLogout}
					className={cn(
						"flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
						collapsed && "justify-center p-2",
					)}
				>
					<LogOut className="h-5 w-5" />
					{!collapsed && <span>Sign out</span>}
				</button>
			</div>
		</div>
	)
}
